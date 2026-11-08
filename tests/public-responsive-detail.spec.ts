import{test,expect}from'@playwright/test';
import{readFile}from'node:fs/promises';
test.setTimeout(240000);
for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1440,height:900}])test(`keeps twelve photo views and reference examination at ${viewport.width}px`,async({page},info)=>{
 await page.setViewportSize(viewport);
 const fixture=JSON.parse(await readFile(process.env.E2E_FIXTURE_PATH!,'utf8'));
 let count=0;const physicalShapes=new Set<string>();
 for(const artwork of fixture.published.slice(0,10)){
  await page.goto('/artworks/'+artwork.id);
  const experience=page.locator('[data-artwork-experience]');await expect(experience).toBeVisible();
  await expect(experience).toHaveAttribute('data-artwork-opening-phase','complete');
  const steps=experience.locator('[data-artwork-progress] button');
  for(let view=0;view<artwork.mediaCount;view++){
   if(view)await steps.nth(view).click();
   const image=experience.locator('[data-active="true"] img[data-testid="artwork-image"]').first();
   await expect(image).toHaveAttribute('data-public-image-resource','artwork:'+artwork.mediaIds[view]);
   await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   physicalShapes.add((await image.getAttribute('width'))+'x'+(await image.getAttribute('height')));
   const before=await image.getAttribute('data-public-image-resource');expect(before).toBeTruthy();
   await image.evaluate(n=>(n as HTMLImageElement).decode());
   const zoom=experience.locator('[data-artwork-entry-controls][aria-pressed="false"]:visible').first();await zoom.click();
   await expect(image).toHaveAttribute('src',/image=r1-reference/);await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).complete&&(n as HTMLImageElement).naturalWidth>0)).toBe(true);
   await expect(image).toHaveAttribute('data-public-image-resource',before!);
   await experience.locator('[data-artwork-entry-controls][aria-pressed="true"]:visible').first().click();
   await page.screenshot({path:info.outputPath(`photo-${++count}.png`)});
  }
  await steps.last().click();await expect(experience.getByRole('status').filter({hasText:'Conclusion'})).toBeVisible();
 }
 expect(count).toBe(12);expect(physicalShapes.size).toBe(12);
});
