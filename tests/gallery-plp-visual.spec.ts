import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {setPlp} from "./plp-helpers";
test('settled visual evidence for the masonry and unchanged mobile surfaces',async({page,request,browserName})=>{
 test.skip(browserName!=='chromium');test.setTimeout(120000);await mkdir('.impeccable/review/plp/settled',{recursive:true});
 async function capture(name:string){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>undefined);}));});
 await page.waitForTimeout(200);await page.screenshot({path:'.impeccable/review/plp/settled/'+name+'-full.png',fullPage:true});await page.screenshot({path:'.impeccable/review/plp/settled/'+name+'.png'});
 }
 try{
 for(const width of [1280,1440]){
 await page.setViewportSize({width,height:1000});
 for(const pattern of ['mixed','all','consecutive']){await setPlp(request,true,pattern);await page.goto('/artworks');await expect(page.getByTestId('artwork-card')).toHaveCount(20);await page.mouse.move(0,0);await capture(pattern+'-'+width);if(pattern==='mixed'){const card=page.getByTestId('artwork-card').first();await card.locator('a').hover();await capture('hover-'+width);}}
 await setPlp(request,false);await page.reload();await capture('classic-'+width);
 }
 for(const width of [320,390,430]){await page.setViewportSize({width,height:1000});await setPlp(request,false);await page.goto('/artworks');await capture('mobile-classic-'+width);await setPlp(request,true);await page.reload();await capture('mobile-active-'+width);}
 }finally{await setPlp(request,false,'none');}
});
