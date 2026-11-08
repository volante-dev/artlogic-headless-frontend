import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {setPlp} from "./plp-helpers";
test.afterEach(async({request})=>{await setPlp(request,false,'none');});
test.setTimeout(120000);
test('mobile card and caption geometry matches the unchanged classic grid',async({page,request})=>{
 for(const width of [320,390,430,600,601,950,951]){
 await page.setViewportSize({width,height:1000});await setPlp(request,false);await page.goto('/artworks');await expect(page.getByTestId('artwork-card')).toHaveCount(20);
 const boxes=()=>page.getByTestId('artwork-card').evaluateAll(nodes=>nodes.slice(0,3).map(n=>{const r=n.getBoundingClientRect(),h=n.querySelector('h2')!.getBoundingClientRect();return {x:r.x,w:r.width,h:r.height,titleY:h.y-r.y};}));const before=await boxes();
 await setPlp(request,true,'all');await page.reload();await expect(page.locator('[data-catalog-layout]')).toBeVisible();const after=await boxes();
 if(width<=950)for(let i=0;i<before.length;i++)for(const k of ['x','w','h','titleY'] as const)expect(Math.abs(before[i]![k]-after[i]![k])).toBeLessThan(1);
 else expect(after[0]!.w).toBeGreaterThan(before[0]!.w*1.9);
 if(process.env.E2E_GALLERY_CAPTURE==='1'&&[320,390,430].includes(width)){await mkdir('.impeccable/review/plp',{recursive:true});await page.screenshot({path:`.impeccable/review/plp/mobile-${width}-${test.info().project.name}.png`,fullPage:true});}
 }
});
