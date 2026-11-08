import {test,expect} from '@playwright/test';
import {openMobile} from './gallery-mobile-helpers';
test('twenty reversible requests keep one panel and reduced motion settles immediately',async({page})=>{
 const scene=await openMobile(page),toggle=scene.locator('[data-mobile-trigger="information"]'),panel=scene.locator('[data-mobile-information-panel]');
 for(let i=0;i<20;i++){await toggle.click();if(i<10)await page.waitForTimeout(80);else await page.waitForTimeout(180);}
 await expect(scene).toHaveAttribute('data-mobile-mode','gallery');await expect(panel).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();await expect(panel).toHaveAttribute('data-information-phase','reading',{timeout:300});
 await page.setViewportSize({width:844,height:390});await expect(panel).toHaveAttribute('data-information-phase','reading');
 await toggle.click();await expect(scene).toHaveAttribute('data-mobile-mode','gallery',{timeout:300});
});

test('hidden and reduced changes settle the same presentation, then inquiry navigation releases it',async({page})=>{
 const scene=await openMobile(page),toggle=scene.locator('[data-mobile-trigger="information"]'),panel=scene.locator('[data-mobile-information-panel]');
 await page.evaluate(()=>{const original=document.fonts.load.bind(document.fonts);let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});document.fonts.load=(font,text)=>gate.then(()=>original(font,text));Reflect.set(window,'releaseInformationFonts',()=>{document.fonts.load=original;release();});});
 await toggle.click();await page.waitForTimeout(300);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(panel).toHaveAttribute('data-information-ready','true');
 await page.evaluate(()=>{(Reflect.get(window,'releaseInformationFonts') as ()=>void)();});await page.waitForTimeout(200);await expect(panel).toHaveAttribute('data-information-ready','true');
 await page.evaluate(()=>{Reflect.deleteProperty(document,'hidden');document.dispatchEvent(new Event('visibilitychange'));});
 await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();await expect(scene).toHaveAttribute('data-mobile-mode','gallery',{timeout:300});
 await page.emulateMedia({reducedMotion:'no-preference'});await scene.getByRole('button',{name:'Agrandir l’image ×2',exact:true}).click();
 await toggle.click();await expect(panel).toHaveAttribute('data-information-ready','true');const media=await scene.getAttribute('data-active-media'),before=await scene.locator('[data-active="true"] img').evaluate(n=>getComputedStyle(n).width);
 await page.setViewportSize({width:844,height:390});await expect(panel).toHaveAttribute('data-information-ready','true');await expect(scene).toHaveAttribute('data-active-media',media!);
 await expect.poll(()=>scene.locator('[data-active="true"] img').evaluate(n=>getComputedStyle(n).width)).not.toBe(before);
 await scene.locator('[data-information-contact] a').click();await expect(page).toHaveURL(/\/contact\?artwork=/);await expect(page.locator('[data-mobile-information-panel]')).toHaveCount(0);
});
