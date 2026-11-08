import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {setPlp} from "./plp-helpers";
test.afterEach(async({request})=>{await setPlp(request,false,'none');});
test.setTimeout(120000);
test('desktop sparse spans preserve source order and geometry for every pattern',async({page,request})=>{
 for(const width of [1280,1440])for(const pattern of ['none','one','mixed','all','consecutive']){
 await setPlp(request,true,pattern);await page.setViewportSize({width,height:1000});await page.goto('/artworks');await page.waitForFunction(()=>Boolean(document.querySelector('header')?.style.getPropertyValue('--site-menu-header-height')));await page.evaluate(()=>document.fonts.ready);await expect(page.getByTestId('artwork-card')).toHaveCount(20);
 const geometry=await page.getByTestId('artwork-card').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,large:n.getAttribute('data-catalog-large')==='true'};}));
 const gap=32,small=(await page.locator('[data-catalog-layout]').boundingBox())!.width/3-gap*2/3;
 for(const r of geometry){expect(Math.abs(r.w-(r.large?2*small+gap:small))).toBeLessThan(2);expect(Math.abs(r.h-r.w)).toBeLessThan(2);expect(r.x+r.w).toBeLessThanOrEqual(width);}
 for(let i=1;i<geometry.length;i++){const a=geometry[i-1]!,b=geometry[i]!;expect(b.y>a.y-1&&(b.y>a.y+1||b.x>a.x)).toBe(true);}
 if(process.env.E2E_GALLERY_CAPTURE==='1'&&['mixed','all','consecutive'].includes(pattern)){await mkdir('.impeccable/review/plp',{recursive:true});await page.screenshot({path:`.impeccable/review/plp/${pattern}-${width}-${test.info().project.name}.png`,fullPage:true});}
 }
 await setPlp(request,false);await page.reload();await expect(page.locator('[data-catalog-layout]')).toHaveCount(0);
});
