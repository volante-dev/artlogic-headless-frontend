import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
test("editorial selections and lists retain both profiles, translations and mobile reading without provider I/O",async({page,baseURL})=>{
 const errors:string[]=[],unexpected:string[]=[];page.on("pageerror",error=>errors.push(error.message));await page.route("**/*",route=>{if(new URL(route.request().url()).origin!==baseURL||new URL(route.request().url()).pathname.startsWith("/api/")){unexpected.push(route.request().url());return route.abort();}return route.continue();});
 for(const profile of ["default","demo-gallery"])for(const locale of ["fr","en"])for(const width of [375,1440]){
  await page.setViewportSize({width,height:900});await page.goto(`/iframe.html?id=sections-articleselection--compact&viewMode=story&globals=profile:${profile};locale:${locale};width:${width}`);await expect(page.locator("main li")).toHaveCount(3);await expect(page.getByRole("heading",{name:locale==="fr"?"Un espace pour regarder":"A space for looking",exact:true}).first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto(`/iframe.html?id=editorial-list--immersive&viewMode=story&globals=profile:${profile};locale:${locale};width:${width}`);await expect(page.getByRole("heading",{name:"Publications",exact:true})).toBeVisible();await expect(page.getByRole("link",{name:locale==="fr"?"La matière et le geste":"Matter and gesture",exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(profile==="default"&&locale==="fr"){await mkdir(".impeccable/review/editorial",{recursive:true});await page.screenshot({path:`.impeccable/review/editorial/list-${width}.png`,fullPage:true,animations:"disabled"});}
 }
 await page.setViewportSize({width:720,height:900});await page.evaluate(()=>document.documentElement.style.zoom="2");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>document.documentElement.style.zoom="1");await page.goto("/iframe.html?id=sections-articleselection--empty&viewMode=story");await expect(page.locator("main li")).toHaveCount(0);
 expect(errors).toEqual([]);expect(unexpected).toEqual([]);
});
