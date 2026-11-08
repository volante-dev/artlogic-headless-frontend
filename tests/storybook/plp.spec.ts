import {test,expect} from "@playwright/test";
test('masonry stories cover two and four columns, long labels, missing images and classic fallback',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 for(const [story,columns] of [['two-columns',2],['four-columns',4]] as const){
 await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--'+story+'&viewMode=story&globals=width:1440');const grid=page.locator('[data-catalog-layout]');await expect(grid).toBeVisible();expect(await grid.evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(columns);
 const card=page.getByTestId('artwork-card').first(),box=await card.boundingBox();expect(Math.abs(box!.height-box!.width)).toBeLessThan(1);
 }
 for(const story of ['long-identity','missing-images','classic','consecutive','all-large']){await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--'+story+'&viewMode=story&globals=width:1440');await expect(page.getByTestId('artwork-card').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
