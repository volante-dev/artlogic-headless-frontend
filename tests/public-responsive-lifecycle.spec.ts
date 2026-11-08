import {test,expect} from '@playwright/test';
test('loaded catalogue images survive a five minute absence, modal return and scrolling',async({page})=>{
 await page.clock.install();await page.goto('/artworks');const first=page.locator('[data-artwork-card] img').first();await expect.poll(()=>first.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.fastForward(5*60*1000);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(first).toBeVisible();expect(await first.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await page.locator('[data-artwork-card] a').first().click();await expect(page.locator('[data-artwork-experience]')).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:15000});
 await page.clock.fastForward(5*60*1000);await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await page.clock.runFor(2000);await expect(page.getByRole('dialog')).toHaveCount(0);
 for(const card of await page.locator('[data-artwork-card]').all()){await card.scrollIntoViewIfNeeded();await expect.poll(()=>card.locator('img').evaluateAll(nodes=>nodes.some(n=>(n as HTMLImageElement).naturalWidth>0))).toBe(true);}
 await expect(page.locator('[data-image-fallback]')).toHaveCount(0);
});
