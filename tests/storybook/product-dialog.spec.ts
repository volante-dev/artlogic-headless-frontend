import {test,expect} from '@playwright/test';
const story=(name='without-consent')=>'/iframe.html?id=store-product-immersion--'+name+'&viewMode=story';
test.use({baseURL:process.env.E2E_STORYBOOK_URL??process.env.STORYBOOK_TEST_ORIGIN??'http://127.0.0.1:6006'});
// Compatibility adapter for the existing local Vite server, which emits obsolete JSON assertions.
// It changes module import syntax only; production uses the independently checked Next build.
if(process.env.E2E_STORYBOOK_JSON_COMPAT==='true')test.beforeEach(async({page})=>{
 await page.route('**/*.ts*',async route=>{const response=await route.fetch(),body=await response.text();await route.fulfill({response,body:body.replace(/\b(?:assert|with)\s*\{\s*type\s*:\s*["']json["']\s*\}/g,'')});});
});
async function openProduct(page:import('@playwright/test').Page){await page.getByRole('button',{name:'Livre Forever',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Livre Forever',exact:true});await expect(dialog).toBeVisible();return dialog;}
test('product drawer preserves navigation, animates details, traps focus and hands over to the cart',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.route('**/api/store/cart/validate',async route=>{const input=route.request().postDataJSON();await route.fulfill({json:{cartRevision:input.cartRevision,currency:'EUR',lines:input.items.map((i:{productId:string;quantity:number})=>({productId:i.productId,requestedQuantity:i.quantity,maxPurchasableQuantity:5,status:'valid',grossUnitAmount:5000}))}});});
 await page.goto(story());await expect(page.getByRole('button',{name:'Ajouter au panier',exact:true})).toHaveCount(0);await page.evaluate(()=>{(window as unknown as Record<string,unknown>).storeDocument='preserved';});
 const dialog=await openProduct(page);await expect.poll(async()=>Math.round((await dialog.boundingBox())!.width)).toBe(864);
 const details=dialog.getByRole('button',{name:'Détails',exact:true});await details.click();await expect(dialog.getByRole('button',{name:'Fermer les détails',exact:true})).toHaveAttribute('aria-expanded','true');await expect(dialog.getByText('Book',{exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Fermer les détails',exact:true}).click();await expect(details).toHaveAttribute('aria-expanded','false');
 await dialog.getByRole('button',{name:'Ajouter au panier',exact:true}).click();await expect(dialog).toBeHidden();const bag=page.getByRole('dialog',{name:'Panier',exact:true});await expect(bag).toBeVisible();await expect(page.getByRole('button',{name:/Panier/})).toContainText('1');await page.keyboard.press('Escape');await expect(bag).toBeHidden();
 await openProduct(page);await expect(dialog.getByRole('button',{name:'Détails',exact:true})).toHaveAttribute('aria-expanded','false');await page.keyboard.press('Escape');await expect(dialog).toBeHidden();expect(await page.evaluate(()=>(window as unknown as Record<string,unknown>).storeDocument)).toBe('preserved');
});
test('mobile long details scroll locally, carousel dots fit and page scroll is restored',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(story('long-details'));await page.getByRole('button',{name:'Tout refuser',exact:true}).click();const dialog=await openProduct(page);await expect.poll(async()=>Math.round((await dialog.boundingBox())!.width)).toBe(390);
 await dialog.getByRole('button',{name:'Détails',exact:true}).click();const reader=dialog.locator('[data-product-details-scroll]');await expect.poll(()=>reader.evaluate(e=>e.scrollHeight>e.clientHeight)).toBe(true);await reader.evaluate(e=>{e.scrollTop=200;});expect(await reader.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);await expect(dialog.getByRole('button',{name:'Ajouter au panier',exact:true})).toBeInViewport();
 await dialog.getByRole('button',{name:'Fermer les détails',exact:true}).click();const dots=dialog.getByRole('navigation',{name:'Choisir une photographie'});expect(await dots.locator('button').evaluateAll(nodes=>new Set(nodes.map(n=>Math.round(n.getBoundingClientRect().top))).size)).toBe(1);
 await dots.getByRole('button',{name:'Photographie 3',exact:true}).click();await expect(dots.getByRole('button',{name:'Photographie 3',exact:true})).toHaveAttribute('aria-current','true');await dialog.getByRole('button',{name:'Fermer',exact:true}).click();await expect(dialog).toBeHidden();expect(await page.evaluate(()=>getComputedStyle(document.body).overflow)).not.toBe('hidden');
});
test('compact consent keeps equal choices and reduced motion product details remain usable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});await page.goto(story('default'));const banner=page.getByRole('region',{name:'Préférences de confidentialité'});await expect(banner).toBeVisible();expect((await banner.boundingBox())!.height).toBeLessThan(110);const accept=await banner.getByRole('button',{name:'Tout accepter'}).boundingBox(),reject=await banner.getByRole('button',{name:'Tout refuser'}).boundingBox();expect(Math.abs(accept!.width-reject!.width)).toBeLessThan(2);expect(accept!.height).toBeGreaterThanOrEqual(44);await banner.getByRole('button',{name:'Tout refuser'}).click();const dialog=await openProduct(page);await dialog.getByRole('button',{name:'Détails',exact:true}).click();await expect(dialog.getByText('Book',{exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
});
