import {test,expect} from '@playwright/test';
test.setTimeout(60000);
for(const width of [390,1440])for(const trigger of ['button','escape'] as const)test(`returns through a right roll and transparent loader at ${width}px (${trigger})`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.goto('/artworks');const anchor=page.locator('[data-artwork-card] a').first();await anchor.click();await expect(page.locator('[data-artwork-experience]')).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:15000});
 await page.evaluate(()=>Reflect.set(window,'closingDocument','retained'));let refreshes=0;page.on('request',r=>{if(new URL(r.url()).pathname==='/artworks'&&decodeURIComponent(r.headers()['next-router-state-tree']??'').includes('"refetch"'))refreshes++;});
 if(trigger==='button')await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();else await page.keyboard.press('Escape');
 const paper=page.locator('[data-artwork-close-phase="rolling"]').filter({has:page.locator('[data-artwork-experience]')}).first();await expect(paper).toBeVisible();
 const frames=await paper.evaluate(n=>n.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes()));expect(frames.some(f=>f.clipPath==='inset(0px 0px 0px 100%)'||f.clipPath==='inset(0 0 0 100%)')).toBe(true);
 const overlay=page.locator('[data-artwork-return-phase]');await expect(overlay).toBeAttached();expect(await overlay.evaluate(n=>getComputedStyle(n).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 await expect(overlay).toHaveAttribute('data-artwork-return-phase','revealing');expect(await page.locator('[data-artwork-background]').evaluate(n=>getComputedStyle(n).filter)).not.toBe('none');
 if(trigger==='button')await page.screenshot({path:info.outputPath(`return-${width}.png`)});
 await expect(overlay).toHaveCount(0);await expect(page.getByRole('dialog')).toHaveCount(0);await expect(anchor).toBeFocused();expect(await page.evaluate(()=>Reflect.get(window,'closingDocument'))).toBe('retained');expect(refreshes).toBe(0);
});
test('keeps the return available with reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/artworks');await page.locator('[data-artwork-card] a').first().click();await expect(page.locator('[data-artwork-experience]')).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:15000});await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('browser Back keeps an exit snapshot until the right roll completes',async({page})=>{
 await page.goto('/artworks');await page.locator('[data-artwork-card] a').first().click();await expect(page.locator('[data-artwork-experience]')).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:15000});await page.goBack();
 await expect(page.locator('[data-artwork-return-phase]')).toBeAttached();await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);await expect(page.locator('[data-artwork-exit-snapshot]')).toHaveCount(0);await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('ordinary browser history never starts an artwork return overlay',async({page})=>{
 await page.goto('/artworks');await page.locator('header a[href="/"]').first().click();await expect(page).toHaveURL(/\/$/);await page.goBack();await expect(page.locator('[data-artwork-card]').first()).toBeVisible();await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);await page.waitForTimeout(650);await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);
});
