import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
test("capture C with fixed demonstration content using the actual production components",async({page})=>{
 test.skip(process.env.E2E_GALLERY_CAPTURE!=="1","Explicit fidelity evidence only");
 const dir=".impeccable/review/gallery/comp";await mkdir(dir,{recursive:true});
 const states=[
  {name:"list",id:"gallery-artworkcatalog--complete-page",width:1440,height:900},
  {name:"arrival",id:"gallery-artworkexperience--arrival",width:1440,height:900},
  {name:"reading",id:"gallery-artworkexperience--intermediate",width:1830,height:910},
  {name:"mobile",id:"gallery-artworkexperience--arrival",width:375,height:805},
  {name:"mobile-reading",id:"gallery-artworkexperience--reading",width:375,height:805},
 ];
 for(const state of states){await page.setViewportSize(state);await page.goto(`/iframe.html?id=${state.id}&viewMode=story&globals=width:${state.width}`);await expect(page.locator('[data-catalog-ready="true"]')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.locator("img").filter({visible:true}).evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));await expect.poll(()=>page.evaluate(()=>document.getAnimations().filter(a=>a.playState==="running").length)).toBe(0);await page.screenshot({path:`${dir}/${state.name}.png`});}
});
