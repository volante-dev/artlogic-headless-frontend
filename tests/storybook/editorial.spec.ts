import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const story=(id:string,extra="")=>`/iframe.html?id=editorial-blocks--${id}&viewMode=story&globals=locale:fr;width:1440${extra}`;
test("the four families reserve media space, reflow on mobile and retain captions after withdrawal",async({page,baseURL})=>{
 const unexpected:string[]=[],errors:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/*",route=>{if(new URL(route.request().url()).origin!==baseURL){unexpected.push(route.request().url());return route.abort();}return route.continue();});
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:900});await page.goto(story("composition"));await expect(page.getByRole("heading",{name:"La lumière comme matière"})).toBeVisible();
  for(const image of await page.locator("figure img").all()){await image.scrollIntoViewIfNeeded();await expect(image).toHaveAttribute("data-ready","true");await expect(image).toHaveCSS("opacity","1");}
  await page.evaluate(()=>scrollTo(0,0));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mkdir(".impeccable/review/editorial",{recursive:true});await page.screenshot({path:`.impeccable/review/editorial/blocks-${width}.png`,fullPage:true,animations:"disabled"});
  await page.goto(story("successive"));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:720,height:900});await page.goto(story("composition"));await page.evaluate(()=>document.documentElement.style.zoom="2");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.evaluate(()=>document.documentElement.style.zoom="1");await page.goto(story("retired-media"));await expect(page.getByText("Détail d’une composition de démonstration. Aucun contenu client.")).toBeVisible();await expect(page.locator("figure img")).toHaveCount(0);await expect(page.getByRole("button",{name:"Slide suivante"})).toHaveCount(0);
 await page.goto(story("players-inert"));await expect(page.getByRole("button",{name:"Lire la vidéo",exact:true})).toHaveCount(3);await expect(page.locator("iframe,video[src]")).toHaveCount(0);expect(unexpected).toEqual([]);expect(errors).toEqual([]);
});
test("carousel keyboard, one/zero-slide states, image enlargement and reduced motion",async({page})=>{
 await page.goto(story("carousel"));const bars=page.getByRole("button",{name:/^Slide [123]$/});await expect(bars.first()).toHaveAttribute("aria-current","true");await bars.first().focus();await page.keyboard.press("ArrowRight");await expect(bars.nth(1)).toHaveAttribute("aria-current","true");
 await page.goto(story("single-slide"));await expect(page.getByRole("button",{name:/Slide (suivante|précédente)/})).toHaveCount(0);await page.getByRole("button",{name:"Agrandir l’image"}).click();const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);await expect(page.getByRole("button",{name:"Agrandir l’image"})).toBeFocused();
 await page.goto(story("no-slides"));await expect(page.locator("figure")).toHaveCount(0);
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto(story("automatic"));await expect(page.getByRole("button",{name:"Reprendre le défilement"})).toBeVisible();const first=page.getByRole("button",{name:"Slide 1",exact:true});await expect(first).toHaveAttribute("aria-current","true");await page.waitForTimeout(3300);await expect(first).toHaveAttribute("aria-current","true");
});
test("native playback uses the actual local video and pauses when its slide becomes inactive",async({page})=>{
 await page.goto(story("native-playback",";playback:live"));const video=page.locator("video");await page.getByRole("button",{name:"Lire la vidéo",exact:true}).click();await expect.poll(()=>video.evaluate(element=>(element as HTMLVideoElement).paused)).toBe(false);expect(await video.evaluate(element=>(element as HTMLVideoElement).muted)).toBe(true);await page.getByRole("button",{name:"Basculer la slide active"}).click();await expect.poll(()=>video.evaluate(element=>(element as HTMLVideoElement).paused)).toBe(true);await expect(video).not.toHaveAttribute("controls","");
});
test("YouTube commands use a controlled SDK, origin-only parameters and destroy the previous source",async({page,baseURL})=>{
 const unexpected:string[]=[];
 await page.addInitScript(()=>{
  const audit:string[]=[];(window as unknown as {editorialAudit:string[]}).editorialAudit=audit;
  (window as unknown as {YT:unknown}).YT={Player:class{
   state=2;constructor(private frame:HTMLIFrameElement,private options:{events:{onReady():void;onStateChange(event:{data:number}):void}}){audit.push("create:"+frame.src);setTimeout(()=>options.events.onReady(),0);}
   playVideo(){this.state=1;audit.push("play");this.options.events.onStateChange({data:1});}
   pauseVideo(){this.state=2;audit.push("pause");this.options.events.onStateChange({data:2});}
   mute(){audit.push("mute");}unMute(){audit.push("unmute");}getPlayerState(){return this.state;}destroy(){audit.push("destroy");this.frame.remove();}
  }};
 });
 await page.route("**/*",route=>{const url=new URL(route.request().url());if(url.origin===baseURL)return route.continue();if(url.origin==="https://www.youtube-nocookie.com")return route.fulfill({contentType:"text/html",body:"<!doctype html><title>Controlled YouTube frame</title>"});unexpected.push(url.origin);return route.abort();});
 await page.goto(story("youtube-playback",";playback:live")+"&privatePreview=never-forward-this");const frame=page.locator('iframe[src*="youtube-nocookie"]');await expect(frame).toBeVisible();const url=new URL((await frame.getAttribute("src"))!);expect(url.searchParams.get("origin")).toBe(baseURL);expect(url.searchParams.get("widget_referrer")).toBe(baseURL);expect(url.toString()).not.toContain("never-forward");await expect(frame).toHaveAttribute("referrerpolicy","strict-origin-when-cross-origin");
 const box=await frame.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(200);expect(box!.height).toBeGreaterThanOrEqual(200);
 await page.getByRole("button",{name:"Lire la vidéo",exact:true}).click();await expect(page.getByRole("button",{name:"Mettre en pause",exact:true})).toBeVisible();await page.getByRole("button",{name:"Activer le son",exact:true}).click();await expect(page.getByRole("button",{name:"Couper le son",exact:true})).toBeVisible();await page.getByRole("button",{name:"Changer la source"}).click();await expect(frame).toHaveAttribute("src",/DEMOvideo02/);const audit=await page.evaluate(()=>(window as unknown as {editorialAudit:string[]}).editorialAudit);expect(audit).toContain("destroy");expect(audit.filter(value=>value==="unmute")).toHaveLength(1);expect(unexpected).toEqual([]);
});
test("the real pinned Vimeo SDK uses a controlled iframe without appending the private page URL",async({page,baseURL})=>{
 const unexpected:string[]=[];
 await page.addInitScript(()=>{const audit:string[]=[];(window as unknown as {editorialAudit:string[]}).editorialAudit=audit;window.addEventListener("message",event=>{if(event.origin==="https://player.vimeo.com"&&event.data?.editorialAudit)audit.push(event.data.editorialAudit);});});
 await page.route("**/*",route=>{
  const url=new URL(route.request().url());if(url.origin===baseURL)return route.continue();if(url.origin!=="https://player.vimeo.com"){unexpected.push(url.origin);return route.abort();}
  return route.fulfill({contentType:"text/html",body:`<!doctype html><title>Controlled Vimeo frame</title><script>const send=data=>parent.postMessage(data,'*');addEventListener('message',event=>{let d=event.data;if(typeof d==='string'){try{d=JSON.parse(d)}catch{return}}if(!d?.method)return;send({editorialAudit:d.method});send({method:d.method,value:d.method==='getVideoId'?123456789:d.method==='setMuted'?d.value:true});if(d.method==='play')send({event:'play'});if(d.method==='pause')send({event:'pause'});});send({event:'ready'});</script>`});
 });
 await page.goto(story("vimeo-playback",";playback:live")+"&privatePreview=never-forward-this");const frame=page.locator('iframe[src*="player.vimeo.com"]');await expect(frame).toBeVisible();await expect(frame).toHaveAttribute("referrerpolicy","strict-origin-when-cross-origin");await page.getByRole("button",{name:"Lire la vidéo",exact:true}).click();await expect(page.getByRole("button",{name:"Mettre en pause",exact:true})).toBeVisible();await page.getByRole("button",{name:"Basculer la slide active"}).click();await expect(page.getByRole("button",{name:"Lire la vidéo",exact:true})).toBeEnabled();
 const audit=await page.evaluate(()=>(window as unknown as {editorialAudit:string[]}).editorialAudit);expect(audit).toContain("getVideoId");expect(audit).toContain("play");expect(audit).not.toContain("appendVideoMetadata");expect(unexpected).toEqual([]);
});
