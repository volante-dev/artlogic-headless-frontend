import {expect,test} from "@playwright/test";
import {fixture} from "./helpers";

test("portrait selections keep 2px gaps and slide to the second image on hover",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto("/");
 const section=page.locator("[data-artwork-selection]").first(),card=section.locator("[data-artwork-card]").first(),frame=card.locator("[data-artwork-card-image]"),media=card.locator("[data-artwork-media]");
 await section.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 const box=(await frame.boundingBox())!;expect(box.width/box.height).toBeCloseTo(.8,2);
 await expect(section.locator("ul")).toHaveCSS("column-gap","2px");await expect(section.locator("ul")).toHaveCSS("row-gap","2px");
 await expect(card.locator("[data-artwork-preview]")).toHaveCount(0);
 await card.hover();await expect(media).toHaveAttribute("data-preview-active","true");
 await expect.poll(()=>card.locator("[data-artwork-primary]").evaluate(el=>Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m41))).toBeCloseTo(-box.width,0);
 await expect.poll(()=>card.locator("[data-artwork-preview] img").evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 await section.screenshot({path:test.info().outputPath("portrait-hover.png")});
 await page.mouse.move(0,0);await expect(media).not.toHaveAttribute("data-preview-active","true");
 await expect(card.locator("[data-artwork-primary]")).toHaveCSS("transform","matrix(1, 0, 0, 1, 0, 0)");
 await card.getByRole("link").focus();await expect(media).not.toHaveAttribute("data-preview-active","true");
 const single=section.locator("[data-artwork-card]").nth(1);await single.hover();await expect(single.locator("[data-artwork-preview]")).toHaveCount(0);
});

test("a failed second image keeps the original visible",async({page})=>{
 const secondary=fixture().published[0]!.mediaIds?.[1];expect(secondary).toBeTruthy();
 await page.route("**/media/"+secondary+"**",route=>route.abort());
 await page.goto("/");const card=page.locator("[data-artwork-selection] [data-artwork-card]").first();await card.hover();
 await expect(card.locator("[data-artwork-preview]")).toHaveCount(1);
 await expect(card.locator("[data-artwork-media]")).not.toHaveAttribute("data-preview-active","true");
 await expect(card.locator("[data-artwork-primary] img")).toBeVisible();
 await expect(card.locator("[data-artwork-primary]")).toHaveCSS("transform","matrix(1, 0, 0, 1, 0, 0)");
});

test("reduced motion changes the preview without a sliding transition",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");
 const card=page.locator("[data-artwork-selection] [data-artwork-card]").first();await card.hover();
 await expect(card.locator("[data-artwork-media]")).toHaveAttribute("data-preview-active","true");
 await expect(card.locator("[data-artwork-primary]")).toHaveCSS("transition-duration","0s");
});

test.describe("touch",()=>{
 test.use({isMobile:true,hasTouch:true,viewport:{width:375,height:812}});
 test("does not request hover previews on touch screens",async({page})=>{
  await page.goto("/");const section=page.locator("[data-artwork-selection]").first();await section.scrollIntoViewIfNeeded();
  await section.locator("[data-artwork-card]").first().getByRole("link").dispatchEvent("pointerenter",{pointerType:"touch"});
  await expect(section.locator("[data-artwork-preview]")).toHaveCount(0);
  await expect(section.locator("ul")).toHaveCSS("column-gap","2px");
  await expect(section.locator("ul")).toHaveCSS("scroll-snap-type","x mandatory");
 });
});

test("the artworks listing keeps the original image on hover",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto("/artworks");
 const card=page.locator("[data-artwork-card]").first(),image=card.locator("[data-artwork-primary] img");await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 const source=await image.evaluate((img:HTMLImageElement)=>img.currentSrc);await card.hover();await page.waitForTimeout(350);
 await expect(card.locator("[data-artwork-preview]")).toHaveCount(0);await expect(card.locator("[data-artwork-media]")).not.toHaveAttribute("data-preview-active","true");
 expect(await image.evaluate((img:HTMLImageElement)=>img.currentSrc)).toBe(source);await expect(card.locator("[data-artwork-primary]")).toHaveCSS("transform","matrix(1, 0, 0, 1, 0, 0)");
});

test.describe("mobile listing",()=>{
 test.use({isMobile:true,hasTouch:true,viewport:{width:375,height:812}});
 test("the first horizontal image uses a 5/4 frame",async({page})=>{
  await page.goto("/artworks");const card=page.locator("[data-artwork-card]").first(),frame=card.locator("[data-artwork-card-image]");
  await expect(card).toHaveAttribute("data-mobile-landscape","true");const box=(await frame.boundingBox())!;expect(box.width/box.height).toBeCloseTo(1.25,2);
  await expect(card.locator("[data-artwork-preview]")).toHaveCount(0);await frame.screenshot({path:test.info().outputPath("mobile-listing-landscape.png")});
 });
});
