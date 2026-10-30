import {test,expect} from "@playwright/test";
import {createRequire} from "node:module";
import {dirname} from "node:path";
import {mkdir} from "node:fs/promises";
import {catalogEntries} from "../../.storybook/section-fixtures";
const require=createRequire(import.meta.url);
const axePath=require.resolve("axe-core/axe.min.js",{paths:[dirname(require.resolve("@storybook/addon-a11y/package.json"))]});

test("all real stories render offline at mobile and desktop widths",async({page,request,baseURL})=>{
  test.setTimeout(180_000);
  const entries=Object.values((await (await request.get("/index.json")).json()).entries) as {id:string;type:string}[];
  const stories=entries.filter(entry=>entry.type==="story");expect(stories.length).toBeGreaterThanOrEqual(50);
  for(const entry of catalogEntries){
    const suffix=(entry.state==="normal"?entry.variant:entry.state).replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
    expect(stories.some(story=>story.id===`sections-${entry.type.toLowerCase()}--${suffix}`)).toBe(true);
  }
  const unexpected:string[]=[],errors:string[]=[];
  await page.route("**/*",async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==baseURL||/^\/(v1|api|auth|preview)\//.test(url.pathname)){unexpected.push(url.origin+url.pathname);await route.abort();}else await route.continue();
  });
  page.on("pageerror",error=>errors.push(error.message));
  for(const width of [375,1440]){
    await page.setViewportSize({width,height:900});
    for(const identity of [{theme:"projection",locale:"fr"},{theme:"editorial",locale:"en"}])for(const entry of stories){
      await page.goto(`/iframe.html?id=${entry.id}&viewMode=story&globals=theme:${identity.theme};locale:${identity.locale};width:${width}`);
      await expect(page.locator('[data-catalog-ready="true"]')).toBeVisible();
      await expect(page.locator(".sb-errordisplay")).not.toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),entry.id+" overflow at "+width).toBe(true);
    }
  }
  expect(unexpected).toEqual([]);expect(errors).toEqual([]);
});

test("theme, profile, language, keyboard and motion use production views",async({page})=>{
  await page.goto("/iframe.html?id=sections-artworkcatalog--grid&viewMode=story&globals=theme:editorial;profile:demo-gallery;locale:en;width:375");
  await expect(page.locator('[data-client="demo-gallery"]')).toHaveCount(3);
  await expect(page.getByRole("heading",{name:"Artworks",exact:true})).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color","rgb(243, 240, 232)");
  await page.goto("/iframe.html?id=components-siteheader--default&viewMode=story&globals=locale:fr;width:375");
  await page.setViewportSize({width:375,height:812});
  const menu=page.locator('button[aria-controls="site-navigation"]');await menu.focus();await page.keyboard.press("Enter");await expect(menu).toHaveAttribute("aria-expanded","true");
  await page.keyboard.press("Escape");await expect(menu).toBeFocused();await expect(menu).toHaveAttribute("aria-expanded","false");
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/iframe.html?id=sections-heromedia--reduced-motion&viewMode=story");
  const video=page.locator("video");await expect(video).toBeVisible();expect(await video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole("button",{name:"Lire le film",exact:true}).click();
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(false);
  await page.getByRole("button",{name:"Mettre le film en pause",exact:true}).click();
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
});

test("representative canvases pass WCAG AA automated checks",async({page})=>{
  for(const width of [375,1440])for(const theme of ["projection","editorial"])for(const id of ["sections-heromedia--immersive","sections-artworkcatalog--grid","components-siteheader--default","sections-textimage--image-left","gallery-artworkexperience--arrival","gallery-artworkexperience--reading","gallery-artworkexperience--long-description","gallery-artworkcatalog--default","gallery-artworkprogress--on-image"]){
    await page.setViewportSize({width,height:900});await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};width:${width}`);
    await expect(page.locator('[data-catalog-ready="true"]')).toBeVisible();await page.addScriptTag({path:axePath});
    const violations=await page.evaluate(async()=>{
      const axe=(window as unknown as {axe:{run:(selector:string,options:unknown)=>Promise<{violations:{id:string;nodes:{target:string[]}[]}[]}>}}).axe;
      return (await axe.run("[data-catalog-ready]",{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations;
    });expect(violations,`${id}/${theme}/${width}`).toEqual([]);
    if(theme==="projection"&&["sections-heromedia--immersive","sections-textimage--image-left"].includes(id)){
      await mkdir(".impeccable/review",{recursive:true});await page.screenshot({path:`.impeccable/review/storybook-${id}-${width}.png`,fullPage:true});
    }
  }
});
