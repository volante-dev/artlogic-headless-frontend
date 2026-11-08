import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

for(const width of [390,1440])test(`zoom fades out and returns through the summary transition at ${width}px`,async({page},info)=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
 test.skip(!site.finaleArtworkIds,'Requires --finale fixtures');
 await page.setViewportSize({width,height:900});
 await page.goto('/artworks/'+site.finaleArtworkIds[3]);
 const scene=page.getByTestId('artwork-experience');
 await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');
 const steps=scene.locator('[data-artwork-progress] button'),previous=steps.nth(await steps.count()-2);
 await previous.click();
 if(width<768)await expect(scene).toHaveAttribute('data-mobile-transition','idle');
 else await expect(scene).toHaveAttribute('data-scroll-motion','idle');
 const controls=width<768?scene.locator('[data-mobile-image-controls]'):scene.locator('[data-view][data-active="true"] [data-artwork-entry-controls]');
 await expect(controls).toBeVisible();
 await controls.evaluate(node=>{
  const record={phase:'opening',samples:[] as {phase:string;opacity:number;visible:boolean}[]};
  Reflect.set(window,'finaleZoomMotion',record);
  const sample=()=>{
   const style=getComputedStyle(node);record.samples.push({phase:record.phase,opacity:Number(style.opacity),visible:style.visibility==='visible'});
   if(node.isConnected&&record.phase!=='done')requestAnimationFrame(sample);
  };requestAnimationFrame(sample);
 });
 await steps.last().click();
 await expect(controls).toHaveCSS('opacity','0');
 await expect(controls).toHaveCSS('visibility','hidden');
 expect(await controls.evaluate(node=>(node as HTMLElement).inert&&node.getAttribute('aria-hidden')==='true')).toBe(true);
 await expect.poll(()=>page.evaluate(()=>Reflect.get(window,'finaleZoomMotion').samples.some((s:{phase:string;opacity:number;visible:boolean})=>s.phase==='opening'&&s.visible&&s.opacity>.05&&s.opacity<.95))).toBe(true);
 // Allow the shared photograph to finish receding before testing its full reverse.
 await expect(scene.locator('[data-finale-description]')).toHaveCSS('opacity','1');
 await page.evaluate(()=>{Reflect.get(window,'finaleZoomMotion').phase='closing';});
 await previous.click();
 await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);
 await expect(controls).toBeVisible();await expect(controls).toHaveCSS('opacity','1');
 expect(await controls.evaluate(node=>(node as HTMLElement).inert)).toBe(false);
 const samples=await page.evaluate(()=>{const record=Reflect.get(window,'finaleZoomMotion');record.phase='done';return record.samples as {phase:string;opacity:number;visible:boolean}[];});
 expect(samples.some(s=>s.phase==='closing'&&s.visible&&s.opacity>.05&&s.opacity<.95)).toBe(true);
 await page.screenshot({path:info.outputPath('zoom-restored.png')});
 await page.emulateMedia({reducedMotion:'reduce'});
 if(width>=768)await expect(scene).toHaveAttribute('data-enhanced','false');
 await previous.click();
 // Reduced motion uses the desktop static photo flow rather than the enhanced stage.
 const reducedControls=width<768?controls:scene.locator('[data-static-view]').last().locator('[data-artwork-entry-controls]');
 await expect(reducedControls).toBeVisible();
 await steps.last().click();await expect(reducedControls).toHaveCSS('visibility','hidden');
 await previous.click();await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);await expect(reducedControls).toBeVisible();
});
