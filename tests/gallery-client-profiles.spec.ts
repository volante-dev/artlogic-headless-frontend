import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test("two client profiles preserve cover, share navigation and isolate publication decisions for the same UUID",async({page,request})=>{
 const {sites}=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8"));test.skip(sites.length<2,"Requires --two-sites");
 const [first,second]=sites,control=(site:typeof first,data:object)=>request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data});
 try{
  for(const site of sites){await page.goto(site.siteOrigin+"/artworks?pageSize=3");await expect(page.getByTestId("artwork-card").first().locator("img")).toBeVisible();expect(await page.getByTestId("artwork-card").first().locator("img").evaluate(n=>getComputedStyle(n).objectFit)).toBe("cover");await page.getByTestId("artwork-card").first().getByRole("link").click();await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toBeVisible();await page.keyboard.press("Escape");await expect(page).toHaveURL(site.siteOrigin+"/artworks?pageSize=3");await expect(page.getByRole("dialog")).toHaveCount(0);}
  await control(second,{action:"visibility",artworkId:second.artworkId,decision:"hidden"});
  expect((await request.get(second.apiOrigin+"/v1/public/artwork-experiences/"+second.artworkId+"?locale=fr")).status()).toBe(404);
  expect((await request.get(first.apiOrigin+"/v1/public/artwork-experiences/"+first.artworkId+"?locale=fr")).status()).toBe(200);
 }finally{await control(second,{action:"restore"});}
});

test("optional masonry stays isolated and both profile slots preserve classic mode",async({page,request})=>{
 const {sites}=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8"));test.skip(sites.length<2,"Requires --two-sites");
 const control=(site:typeof sites[number],enabled:boolean)=>request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"plp",enabled,pattern:"mixed"}});
 try{await control(sites[0],true);for(const [i,site] of sites.entries()){await page.goto(site.siteOrigin+'/artworks');await expect(page.getByTestId('artwork-card')).toHaveCount(20);await expect(page.locator('[data-catalog-layout]')).toHaveCount(i===0?1:0);}
 await control(sites[1],true);await page.reload();await expect(page.locator('[data-catalog-layout]')).toHaveCount(1);
 }finally{for(const site of sites)await control(site,false);}
});
