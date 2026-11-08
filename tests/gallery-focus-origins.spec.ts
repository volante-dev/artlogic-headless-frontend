import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test("catalogue, builder selection, editorial work and direct link share the opening focus",async({page,request})=>{
 test.setTimeout(90000);const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];expect(site.focusArticlePath).toBeTruthy();await page.emulateMedia({reducedMotion:"reduce"});
 expect((await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"focus",artworkId:site.artworkId,x:.78,y:.22}})).ok()).toBe(true);
 const suffix=site.artworkId.replaceAll("-","");
 for(const path of ["/artworks","/",site.focusArticlePath]){
  await page.goto(path);expect(await page.locator('[data-artwork-focus="true"]').count()).toBe(0);
  await page.locator(`a[href*="${suffix}"],a[href$="/${site.artworkId}"]`).first().click();await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(1);
  await page.waitForURL(url=>url.pathname.startsWith("/artworks/"));await page.keyboard.press("Escape");await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(0);await page.waitForURL(url=>url.pathname===path);await expect(page.locator("[data-artwork-background]")).not.toHaveAttribute("inert","");
 }
 await page.goto("/artworks/"+site.artworkId);await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(1);await page.reload();await expect(page.locator('[data-artwork-focus="true"]')).toHaveCount(1);
});
