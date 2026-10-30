import {test,expect} from "@playwright/test";
import {mkdir,readFile,writeFile} from "node:fs/promises";
test("capture the approved gallery compositions in one desktop/mobile batch",async({page})=>{
 test.skip(process.env.E2E_GALLERY_CAPTURE!=="1","Explicit visual capture run only");test.setTimeout(90000);
 const site=JSON.parse(await readFile(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0],directory=".impeccable/review/gallery";await mkdir(directory,{recursive:true});
 const geometry:unknown[]=[];
 for(const width of [1440,375]){
  await page.setViewportSize({width,height:width===1440?900:812});await page.goto("/artworks?pageSize=3");await expect(page.getByTestId("artwork-card")).toHaveCount(3);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole("heading",{name:"Œuvres",exact:true})).toBeVisible();await expect(page.getByRole("banner")).toBeVisible();await page.getByTestId("artwork-card").locator("img").evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
  await page.screenshot({path:`${directory}/list-${width}.png`,fullPage:true});
  await page.goto("/artworks?q=unmatched-synthetic-search");await expect(page.getByRole("status").filter({hasText:/Aucune œuvre/})).toBeVisible();await page.screenshot({path:`${directory}/empty-${width}.png`,fullPage:true});
  await page.goto("/artworks/"+site.artworkId);const scene=page.getByRole("dialog").getByTestId("artwork-experience");await expect(scene).toBeVisible();await scene.locator("img").first().evaluate(img=>(img as HTMLImageElement).decode());await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>scene.evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==="running").length)).toBe(0);
  const capture=async(name:string)=>{await page.screenshot({path:`${directory}/${name}-${width}.png`});geometry.push({name,width,frame:await scene.getByTestId("artwork-frame").boundingBox(),transition:await scene.getAttribute("data-transition"),tone:await scene.getAttribute("data-rail-tone")});};
  await capture("arrival");const dialog=page.getByRole("dialog");
  if(width===1440){const time=new Date("2026-10-29T12:00:00Z");await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));await page.mouse.move(1100,450);await page.mouse.wheel(0,8);await page.clock.runFor(100);const progress=Number(await scene.getAttribute("data-transition"));expect(progress).toBeGreaterThan(0);expect(progress).toBeLessThan(1);await capture("transition");await page.clock.runFor(600);await expect(scene).toHaveAttribute("data-transition","1");await capture("reading");await page.clock.resume();}
  else{await dialog.evaluate(n=>{n.scrollTop=812;});await expect(scene).toHaveAttribute("data-rail-tone","paper");await capture("reading");}
  const rail=page.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});for(const [name,index]of [["intermediate",1],["final",2]] as const){await rail.getByRole("button").nth(index).click();await expect(rail.getByRole("button").nth(index)).toHaveAttribute("aria-current","step");if(width===1440)await expect(scene).toHaveAttribute("data-scroll-motion","idle");await capture(name);}
 }
 await writeFile(directory+"/geometry.json",JSON.stringify(geometry,null,2));
});
