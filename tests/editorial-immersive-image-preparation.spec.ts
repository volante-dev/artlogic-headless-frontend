import {test,expect,type Locator,type Page} from '@playwright/test';
test.skip(!process.env.E2E_EDITORIAL_FIXTURE?.includes('/immersive'),'Requires isolated immersive harness.');
async function selectView(reader:Locator,image:Locator){
 const index=await image.evaluate(element=>{const view=element.closest('[data-editorial-view]');return [...element.closest('[data-editorial-immersive=true]')!.querySelectorAll('[data-editorial-view]')].indexOf(view!);});
 await reader.getByRole('navigation',{name:'Parcours de lecture'}).getByRole('button').nth(index).click();
}
async function ready(image:Locator){await expect.poll(()=>image.evaluate(element=>element instanceof HTMLImageElement&&element.complete&&element.naturalWidth>0)).toBe(true);}
async function recordMetadata(page:Page){await page.evaluate(()=>{
 const original=window.fetch,events:string[]=[];(window as unknown as {metadataReads:string[]}).metadataReads=events;
 window.fetch=(input,init)=>{if(typeof input==='string'&&input.endsWith('/api/image-descriptors/query'))for(const r of JSON.parse(String(init?.body)).resources)events.push(r.resourceKind+':'+r.resourceId);return original.call(window,input,init);};
});}
for(const width of [390,1440])test(`upcoming images and adjacent slides are ready before navigation at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/publications/etude-editoriale-1');const reader=page.locator('[data-editorial-immersive=true]');await expect(reader).toBeVisible();
 const upcoming=reader.locator('[data-state=inactive] img[loading=eager]').first();await ready(upcoming);const resource=await upcoming.getAttribute('data-public-image-resource');
 await expect(upcoming.locator('xpath=ancestor::section[@data-editorial-view]')).toHaveAttribute('inert','');
 await recordMetadata(page);await upcoming.evaluate(element=>{(window as unknown as {preparedImage:Element}).preparedImage=element;});
 await selectView(reader,upcoming);await expect(reader).toHaveAttribute('data-reader-state','ready');
 expect(await reader.locator('[data-state=active]').evaluate(view=>{const image=(window as unknown as {preparedImage:HTMLImageElement}).preparedImage;return view.contains(image)&&image.complete&&image.naturalWidth>0;})).toBe(true);
 expect(await page.evaluate(resource=>(window as unknown as {metadataReads:string[]}).metadataReads.includes(resource!),resource)).toBe(false);
 let carousel=reader.locator('[data-state=active] [data-editorial-carousel]');
 if(!await carousel.count()){
  const queued=reader.locator('[data-state=inactive] [data-editorial-carousel] img').first();if(!await queued.count()){const upcoming=reader.locator('[data-state=inactive] img[loading=eager]').first();await ready(upcoming);await selectView(reader,upcoming);await expect(reader).toHaveAttribute('data-reader-state','ready');}await ready(queued);await selectView(reader,queued);await expect(reader).toHaveAttribute('data-reader-state','ready');carousel=reader.locator('[data-state=active] [data-editorial-carousel]');
 }
 const next=carousel.locator('[data-editorial-slide-phase=warming] img').first();await ready(next);await next.evaluate(element=>{(window as unknown as {preparedSlide:Element}).preparedSlide=element;});
 // The next slide is the first warmed sibling of the active slide in this fixture.
 await carousel.getByRole('button',{name:'Slide 2',exact:true}).click();await expect(carousel).toHaveAttribute('data-editorial-carousel-state','ready');
 expect(await carousel.evaluate(root=>{const image=(window as unknown as {preparedSlide:HTMLImageElement}).preparedSlide;return root.querySelector('[data-editorial-slide-phase=active]')?.contains(image)&&image.complete&&image.naturalWidth>0;})).toBe(true);
});
