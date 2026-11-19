import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test.afterEach(async({request})=>{const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"mixedShape",enabled:false}});});

test("horizontal media occupies exactly 60 percent and animates both format changes",async({page,request},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1440,height:900});
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];
 expect((await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"mixedShape",enabled:true}})).ok()).toBe(true);
 await page.goto("/artworks/"+site.artworkId);
 const scene=page.getByRole("dialog").getByTestId("artwork-experience"),frame=scene.getByTestId("artwork-frame"),rail=scene.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});
 await expect(scene).toHaveAttribute("data-artwork-opening-phase","complete",{timeout:30000});
 const settle=async(index:number)=>{await expect(rail.getByRole("button").nth(index)).toHaveAttribute("aria-current","step");await expect(scene).toHaveAttribute("data-scroll-motion","idle");await expect(scene).not.toHaveAttribute("data-artwork-shape-transition","running");};
 await rail.getByRole("button").nth(2).click();await settle(2);await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(640,0);
 const sample=async()=>page.evaluate(()=>{const widths:number[]=[];(window as unknown as {shapeWidths:number[]}).shapeWidths=widths;const started=performance.now();function tick(){const frame=document.querySelector('[data-testid="artwork-frame"]');if(frame)widths.push(frame.getBoundingClientRect().width);if(performance.now()-started<850)requestAnimationFrame(tick);}tick();});
 await sample();await rail.getByRole("button").nth(1).click();await settle(1);
 await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(1440*.6,0);
 expect((await page.evaluate(()=>(window as unknown as {shapeWidths:number[]}).shapeWidths)).some(w=>w>650&&w<850)).toBe(true);
 const layout=await scene.evaluate(n=>{const image=n.querySelector('[data-testid="artwork-frame"]')!.getBoundingClientRect(),info=n.querySelector('[data-artwork-information-identity]')!.getBoundingClientRect();return {left:image.left,infoRight:info.right};});expect(layout.infoRight).toBeLessThanOrEqual(layout.left+1);
 if(info.project.name==="chromium")await page.screenshot({path:".runtime/gallery-horizontal-desktop.png"});
 await sample();await rail.getByRole("button").nth(2).click();await settle(2);
 await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(640,0);
 expect((await page.evaluate(()=>(window as unknown as {shapeWidths:number[]}).shapeWidths)).some(w=>w>650&&w<850)).toBe(true);
 await page.setViewportSize({width:1280,height:800});await rail.getByRole("button").nth(1).click();await settle(1);
 await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(1280*.6,0);
 await rail.getByRole("button").nth(2).click();await rail.getByRole("button").nth(1).click();await settle(1);
 await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(1280*.6,0);
 await rail.getByRole("button",{name:"Conclusion",exact:true}).click();await expect(scene.locator('[data-artwork-finale]')).toBeVisible();
 await rail.getByRole("button").nth(1).click();await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);await settle(1);
 await expect.poll(async()=>(await frame.boundingBox())!.width).toBeCloseTo(1280*.6,0);
 await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"mixedShape",enabled:false}});
});

test("the desktop listing uses the published modal focus while mobile stays centred",async({page,request})=>{
 test.setTimeout(60000);const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];
 expect((await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"publishedFocus",artworkId:site.artworkId,x:1,y:0}})).ok()).toBe(true);
 const suffix=site.artworkId.replaceAll("-","");
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto("/artworks");
  const card=page.locator(`[data-artwork-card]:has(a[href*="${suffix}"])`),media=card.locator('[data-artwork-media]'),image=media.locator('[data-artwork-primary] img');
  await expect(media).toHaveAttribute("data-artwork-focus-ready","true",{timeout:30000});
  await expect(image).toHaveCSS("object-fit","cover");
  await expect(image).toHaveCSS("object-position",width===1440?"50% 0%":"50% 50%");
 }
 const old=await request.get(site.siteOrigin+"/api/artwork-catalog?locale=fr");expect((await old.json()).items[0]).not.toHaveProperty("heroFocus");
 const current=await request.get(site.siteOrigin+"/api/artwork-catalog?locale=fr",{headers:{"X-Artwork-Card-Focus":"1"}});expect((await current.json()).items.find((a:{id:string})=>a.id===site.artworkId).heroFocus).toMatchObject({x:1,y:0});
});
