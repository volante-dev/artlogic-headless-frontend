import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
const site=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
async function conclusion(page:Page){
 await page.setViewportSize({width:390,height:844});await page.goto('/artworks/'+site().finaleArtworkIds[4]);
 const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(scene).toHaveAttribute('data-mobile-mode','finale');await expect(scene.locator('section[data-finale-reading]')).toHaveCSS('opacity','1');
 const description=scene.locator('[data-finale-description]');await expect(description).toHaveAttribute('data-scrollable','true');return {scene,description};
}
test('reading focus never captures backward wheel gestures over the photo',async({page})=>{
 const {scene,description}=await conclusion(page);await description.focus();
 const frame=scene.getByTestId('artwork-frame'),box=(await frame.boundingBox())!;await frame.dispatchEvent('wheel',{deltaY:-160,clientX:box.x+box.width*.45,clientY:box.y+box.height*.12});await expect(scene).toHaveAttribute('data-mobile-mode','gallery');await expect(page.getByRole('dialog')).toHaveJSProperty('scrollTop',0);
});
async function fromScrolledList(page:Page){
 await page.addInitScript(()=>window.addEventListener('artwork-origin-ready',()=>Reflect.set(window,'originReady',true)));
 await page.setViewportSize({width:390,height:844});await page.goto('/artworks');await page.waitForFunction(()=>Reflect.get(window,'originReady'));
 await page.evaluate(id=>{const main=document.querySelector('main')!,spacer=document.createElement('div');spacer.style.height='3000px';main.prepend(spacer);const link=document.createElement('a');link.href='/artworks/'+id;link.dataset.probeArtwork='';link.style.cssText='position:fixed;top:180px;left:30px;z-index:10';link.textContent='Ouvrir cette œuvre';main.append(link);scrollTo(0,800);},site().finaleArtworkIds[4]);
 const origin=await page.evaluate(()=>scrollY);await page.locator('[data-probe-artwork]').click();const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');return {scene,origin};
}
test('locks the document throughout the conclusion and restores the listing position on close',async({page})=>{
 const {scene,origin}=await fromScrolledList(page);expect(origin).toBeGreaterThan(500);await expect(page.locator('body')).toHaveCSS('overflow-y','hidden');await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(scene.locator('section[data-finale-reading]')).toHaveCSS('opacity','1');await expect(page.locator('body')).toHaveCSS('overflow-y','hidden');
 await scene.locator('[data-finale-description]').focus();const frame=scene.getByTestId('artwork-frame'),box=(await frame.boundingBox())!;await frame.dispatchEvent('wheel',{deltaY:-160,clientX:box.x+100,clientY:box.y+100});await expect(scene).toHaveAttribute('data-mobile-mode','gallery');expect(await page.evaluate(()=>scrollY)).toBe(origin);
 await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);await expect(page.locator('body')).not.toHaveCSS('overflow-y','hidden');await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(origin);
});
test('native reading scroll stays inside the conclusion while the document is locked',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native touch injection is exposed by Chromium CDP.');
 const {scene,origin}=await fromScrolledList(page);await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(scene.locator('section[data-finale-reading]')).toHaveCSS('opacity','1');
 const description=scene.locator('[data-finale-description]');await description.evaluate(node=>node.scrollTop=0);const session=await page.context().newCDPSession(page),box=(await description.boundingBox())!,x=box.x+box.width*.4,y=box.y+box.height*.75;
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*12}]});await page.waitForTimeout(20);}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>description.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);await expect(scene).toHaveAttribute('data-mobile-mode','finale');expect(await page.evaluate(()=>scrollY)).toBe(origin);await expect(page.locator('body')).toHaveCSS('overflow-y','hidden');await session.detach();
});
