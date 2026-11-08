import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
test("the immersive article stays readable at both widths, with no cover, a long title and enlarged text",async({page,baseURL})=>{
 const errors:string[]=[],external:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/*",route=>{if(new URL(route.request().url()).origin!==baseURL){external.push(route.request().url());return route.abort();}return route.continue();});
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:900});await page.goto("/iframe.html?id=editorial-article--immersive&viewMode=story&globals=locale:fr;width:"+width);
  await expect(page.getByRole("heading",{name:"La matière et le geste",exact:true})).toBeVisible();await expect(page.getByText("30 octobre 2026",{exact:true})).toBeVisible();
  const cover=page.locator("article>header img");await expect.poll(()=>cover.evaluate(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mkdir(".impeccable/review/editorial",{recursive:true});await page.screenshot({path:`.impeccable/review/editorial/article-${width}.png`,animations:"disabled"});
  await page.goto("/iframe.html?id=editorial-article--long-title&viewMode=story&globals=locale:fr;width:"+width);await expect(page.locator("article h1")).toContainText("transmissions");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto("/iframe.html?id=editorial-article--without-cover&viewMode=story");await expect(page.locator("article>header img")).toHaveCount(0);await expect(page.locator("article h1")).toBeVisible();
 await page.setViewportSize({width:720,height:900});await page.evaluate(()=>document.documentElement.style.zoom="2");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);expect(external).toEqual([]);
});
