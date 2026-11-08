import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const sites=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites;
test("opening focus geometry matches the cover centre for three ratios and five points",async({page,request},info)=>{
 test.setTimeout(180000);const site=sites()[0];test.skip(!site.focusArtworkIds,"Requires --focus fixtures");await page.emulateMedia({reducedMotion:"reduce"});
 for(const width of [390,1440]){const height=width===390?844:900;await page.setViewportSize({width,height});
  for(const artworkId of site.focusArtworkIds)for(const point of [{x:.5,y:.5},{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}]){
   expect((await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"focus",artworkId,...point}})).ok()).toBe(true);
   await page.goto("/artworks/"+artworkId);const surface=page.locator('[data-artwork-focus="true"]').first();await expect(surface).toHaveAttribute("data-artwork-focus-ready","true");await expect(surface.locator('img').first()).toBeVisible();await expect.poll(()=>surface.locator('img').first().evaluate(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)).toBe(true);
   const result=await surface.evaluate((el,p)=>{const image=el.querySelector('img')!,style=getComputedStyle(image),frame={width:(el as HTMLElement).clientWidth,height:(el as HTMLElement).clientHeight};const scale=Math.max(frame.width/image.naturalWidth,frame.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale,expectedX=Math.max(frame.width-w,Math.min(0,frame.width/2-p.x*w)),expectedY=Math.max(frame.height-h,Math.min(0,frame.height/2-p.y*h));const position=style.objectPosition.match(/-?[\d.]+%/g)?.map(Number.parseFloat)??[];return {fit:style.objectFit,position:style.objectPosition,boxWidth:image.getBoundingClientRect().width,boxHeight:image.getBoundingClientRect().height,frameWidth:frame.width,frameHeight:frame.height,dx:Math.abs((frame.width-w)*(position[0]!/100)-expectedX),dy:Math.abs((frame.height-h)*(position[1]!/100)-expectedY)};},point);
   expect(result.fit).toBe("cover");expect(result.boxWidth).toBeCloseTo(result.frameWidth,0);expect(result.boxHeight).toBeCloseTo(result.frameHeight,0);expect(result.dx,result.position).toBeLessThanOrEqual(2);expect(result.dy,result.position).toBeLessThanOrEqual(2);
  }
  if(info.project.name==="chromium")await page.screenshot({path:`.runtime/focus-public-${width}.png`});
 }
});
test("focus is not applied to explicit inspection or zoom, and returns to the opening image",async({page,request})=>{
 const site=sites()[0];await page.setViewportSize({width:390,height:844});await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"focus",artworkId:site.artworkId,x:.8,y:.3}});
 await page.goto("/artworks/"+site.artworkId);await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(1);
 const zoom=page.getByRole("button",{name:/Agrandir.*2|Zoom in/i}).first();
 await expect(zoom).toBeEnabled();await zoom.click();await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(0);
 await page.getByRole("button",{name:/Revenir à la taille normale|Return to original size/i}).first().click();await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(1);
});
test("focus is ready on every visible entrance frame and responds to rotation",async({browser,baseURL,request})=>{
 test.setTimeout(60000);const site=sites()[0];await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"focus",artworkId:site.artworkId,x:.8,y:.3}});
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},recordVideo:{dir:".runtime/focus-opening-video",size:{width:390,height:844}}});
 try{const page=await context.newPage();const server=await page.request.get(baseURL+"/artworks/"+site.artworkId);const html=await server.text();expect(html.includes("data-artwork-focus-pending")||!html.includes("data-artwork-entry-media")).toBe(true);await page.addInitScript(()=>{const samples:{ready:string|null;position:string}[]=[];(window as unknown as {focusFrames:typeof samples}).focusFrames=samples;const frame=()=>{const media=document.querySelector('[data-artwork-entry-media]'),image=media?.querySelector('img');if(image&&(image as HTMLImageElement).naturalWidth>0&&media?.closest('[data-artwork-media-ready="true"]')){const focus=media.querySelector('[data-artwork-focus]')??(media.matches('[data-artwork-focus]')?media:null);samples.push({ready:focus?.getAttribute('data-artwork-focus-ready')??null,position:getComputedStyle(image).objectPosition});}requestAnimationFrame(frame);};requestAnimationFrame(frame);});
  await page.goto("/artworks/"+site.artworkId);await expect(page.locator('[data-artwork-focus-ready="true"]')).toHaveCount(1);await expect.poll(()=>page.evaluate(()=>(window as unknown as {focusFrames:unknown[]}).focusFrames.length)).toBeGreaterThan(30);
  const frames=await page.evaluate(()=>(window as unknown as {focusFrames:{ready:string|null;position:string}[]}).focusFrames);expect(frames.every(f=>f.ready==="true")).toBe(true);expect(new Set(frames.map(f=>f.position)).size).toBe(1);
  await page.setViewportSize({width:844,height:390});await expect(page.locator('[data-artwork-focus-ready="true"]')).toHaveCount(1);await expect(page.locator('[data-artwork-focus="true"] img').first()).toHaveCSS('object-fit','cover');
 }finally{await context.close();}
});

test("without a focus the opening image fills its frame and stays centred",async({page,request})=>{
 test.setTimeout(90000);const site=sites()[0];expect((await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"focusClear"}})).ok()).toBe(true);
 for(const reducedMotion of ["reduce","no-preference"] as const){await page.emulateMedia({reducedMotion});for(const width of [390,1440]){await page.setViewportSize({width,height:width===390?844:900});for(const id of site.focusArtworkIds){await page.goto("/artworks/"+id);const root=page.locator('[data-artwork-experience]');await expect(root).toHaveAttribute('data-artwork-media-ready','true');await expect(root).toHaveAttribute('data-artwork-opening-phase','complete');
  const result=await page.locator('[data-artwork-entry-media] img').first().evaluate(i=>{const style=getComputedStyle(i),frame=i.closest('[data-artwork-entry-media]') as HTMLElement;return{image:[(i as HTMLElement).offsetWidth,(i as HTMLElement).offsetHeight],frame:[frame.clientWidth,frame.clientHeight],fit:style.objectFit,position:style.objectPosition};});expect(result.image).toEqual(result.frame);expect(result.fit).toBe('cover');expect(result.position).toBe('50% 50%');
 }}}
});
