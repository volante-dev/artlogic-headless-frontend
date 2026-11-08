import {test,expect} from "@playwright/test";
import {readFileSync,mkdirSync} from "node:fs";
for(const width of [390,1440])test(`intro drift and slide alignment at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];await page.goto('/artworks/'+site.artworkId);
 const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');await page.evaluate(()=>document.fonts.ready);
 const drift=scene.locator('[data-artwork-intro-drift]').first();
 const motion=await drift.evaluate(n=>{const a=n.getAnimations()[0];if(!a)throw Error('missing intro motion');a.pause();const duration=a.effect!.getTiming().duration;a.currentTime=0;const start=new DOMMatrix(getComputedStyle(n).transform).m41;a.currentTime=10000;const end=new DOMMatrix(getComputedStyle(n).transform).m41;return {duration,start,end};});
 expect(motion.duration).toBe(10000);expect(motion.start).toBeGreaterThan(0);expect(motion.end).toBeLessThan(0);
 const frost=scene.locator('[data-artwork-frost]');const title=frost.locator(width<768?'h1':'p').first();const before=(await title.boundingBox())!;
 const decor=await frost.evaluate((n,mobile)=>{const s=getComputedStyle(n,mobile?null:'::before');return {blur:s.backdropFilter,radius:s.borderRadius,line:s.outlineWidth};},width<768);expect(decor.blur).toBe('blur(10px)');expect(decor.radius).toBe('0px');expect(decor.line).toBe('1px');
 mkdirSync('.impeccable/review',{recursive:true});await page.screenshot({path:`.impeccable/review/artwork-intro-${width}.png`});
 const rail=scene.getByRole('navigation',{name:'Vues de l’œuvre',exact:true});await rail.getByRole('button').nth(1).click();
 await expect.poll(()=>scene.getAttribute(width<768?'data-mobile-transition':'data-scroll-motion')).toBe('idle');
 if(width>=768){const image=scene.locator('[data-view="1"] img');expect((await image.boundingBox())!.height).toBeCloseTo((await scene.getByTestId('artwork-frame').boundingBox())!.height,0);const after=(await scene.locator('[data-artwork-title]').boundingBox())!;expect(after.x).toBeCloseTo(before.x,0);expect(after.y).toBeCloseTo(before.y,0);const transform=await drift.evaluate(n=>new DOMMatrix(getComputedStyle(n).transform).toFloat64Array().slice(12,14));expect(Math.abs(transform[0])).toBeLessThan(.01);expect(Math.abs(transform[1])).toBeLessThan(.01);}
 else{const after=(await title.boundingBox())!;expect(after.x).toBeCloseTo(before.x,0);expect(after.y).toBeCloseTo(before.y,0);}
 await page.screenshot({path:`.impeccable/review/artwork-slide-two-${width}.png`});
 await page.emulateMedia({reducedMotion:'reduce'});expect(await drift.evaluate(n=>n.getAnimations().length)).toBe(0);
});
