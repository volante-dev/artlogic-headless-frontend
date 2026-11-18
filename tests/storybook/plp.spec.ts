import {test,expect} from "@playwright/test";
if(process.env.E2E_STORYBOOK_JSON_COMPAT==='true')test.beforeEach(async({page})=>{await page.route('**/*.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/\b(?:assert|with)\s*\{\s*type\s*:\s*["']json["']\s*\}/g,'')});});});
test('masonry stories cover two and four columns, long labels, missing images and classic fallback',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 for(const [story,columns] of [['two-columns',2],['four-columns',4]] as const){
 await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--'+story+'&viewMode=story&globals=width:1440');const grid=page.locator('[data-catalog-layout]');await expect(grid).toBeVisible();expect(await grid.evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(columns);
 const card=page.getByTestId('artwork-card').first(),box=await card.boundingBox();expect(Math.abs(box!.height-box!.width*1.25)).toBeLessThan(1);
 }
 for(const story of ['long-identity','missing-images','classic','consecutive','all-large']){await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--'+story+'&viewMode=story&globals=width:1440');await expect(page.getByTestId('artwork-card').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('portrait masonry retains its ratio at responsive boundaries and uses compact margins',async({page})=>{
 for(const width of [390,767,768,950,951,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--mixed&viewMode=story&globals=width:1440');
  const grid=page.locator('[data-catalog-layout="masonry"]');await expect(grid).toBeVisible();
  const measured=await grid.evaluate(node=>{const style=getComputedStyle(node);return {columns:style.gridTemplateColumns.split(' ').length,gap:Number.parseFloat(style.columnGap),left:node.getBoundingClientRect().left,frames:[...node.querySelectorAll('[data-artwork-card-image]')].map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height};})};});
  expect(measured.columns).toBe(width<=600?1:width<=950?2:3);expect(measured.gap).toBe(8);if(width<=767)expect(measured.left).toBeCloseTo(8,0);
  for(const frame of measured.frames)expect(Math.abs(frame.h-frame.w*1.25)).toBeLessThan(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('mobile captions stay close to their image with breathing room before the next artwork',async({page})=>{
 await page.setViewportSize({width:390,height:1000});await page.emulateMedia({reducedMotion:"reduce"});await page.goto('/iframe.html?id=gallery-artworkmasonrycatalog--mixed&viewMode=story&globals=width:1440');await expect(page.getByTestId('artwork-card').first()).toBeVisible();
 const gaps=await page.getByTestId('artwork-card').evaluateAll(nodes=>{const first=nodes[0]!,second=nodes[1]!,image=first.querySelector('[data-artwork-card-image]')!.getBoundingClientRect(),title=first.querySelector('h2')!.getBoundingClientRect(),artist=first.querySelector('p')!.getBoundingClientRect();return {imageToTitle:title.top-image.bottom,titleToArtist:artist.top-title.bottom,next:second.getBoundingClientRect().top-first.getBoundingClientRect().bottom};});
 expect(gaps.imageToTitle).toBeCloseTo(8,0);expect(gaps.titleToArtist).toBeCloseTo(4,0);expect(gaps.next).toBeCloseTo(24,0);
});
