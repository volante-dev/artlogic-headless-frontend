import {addCatalogProduct} from './commerce/product.cases';
import {verifyOrderTracking} from './commerce/tracking.cases';
import {test,expect} from '@playwright/test';
import {verifyCatalogCart,verifyRejectedAndStaleCart} from './commerce/catalog.cases';
import {verifyGuestCheckout} from './commerce/checkout.cases';
import {verifyConsent,verifyNecessaryOnlyConsent} from './commerce/consent.cases';
import {verifyWithdrawal} from './commerce/withdrawal.cases';
import {verifySuspendedCommerce} from './commerce/activation.cases';
import {verifyLargeCart} from './commerce/resilience.cases';
test('Store catalog, anchored confirmation and restored cart',async({page})=>{await page.setViewportSize({width:1440,height:900});await verifyCatalogCart(page);});
test('Unavailable quantity preserves the confirmed cart',async({page})=>verifyRejectedAndStaleCart(page));
test('Mobile Store cart stays usable at 375px',async({page})=>{await page.setViewportSize({width:375,height:812});await verifyCatalogCart(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
test('Home to Store preserves the document and switches to the standard header',async({page})=>{
 await page.goto('/');await expect(page.getByRole('banner')).toHaveAttribute('data-header-appearance','immersive');await page.evaluate(()=>{(window as unknown as Record<string,unknown>).commerceNavigationMarker='same-document';});
 await page.getByRole('banner').getByRole('link',{name:'Store',exact:true}).click();
 await expect(page.getByRole('heading',{name:/Store/})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as Record<string,unknown>).commerceNavigationMarker)).toBe('same-document');
 await expect(page.getByRole('banner')).toHaveAttribute('data-header-appearance','standard');
 await page.goBack();await expect(page.getByRole('banner')).toHaveAttribute('data-header-appearance','immersive');
 expect(await page.evaluate(()=>(window as unknown as Record<string,unknown>).commerceNavigationMarker)).toBe('same-document');
});
test('Fifty long cart titles remain contained and keyboard usable with reduced motion',async({page})=>{test.setTimeout(60000);await page.setViewportSize({width:375,height:812});await verifyLargeCart(page);});
test('Guest checkout, distinct billing, simulated decline, confirmation and private receipt',async({page})=>{test.setTimeout(90000);await page.setViewportSize({width:375,height:812});await verifyGuestCheckout(page);});
test('Desktop guest checkout completes within three minutes',async({page})=>{test.setTimeout(90000);await page.setViewportSize({width:1440,height:900});const duration=await verifyGuestCheckout(page);expect(duration).toBeLessThan(180000);await test.info().attach('synthetic-journey-duration',{body:JSON.stringify({width:1440,durationMs:duration}),contentType:'application/json'});});

test('Guest tracking protects four fulfillment states and private documents',async({page})=>{test.setTimeout(90000);await verifyOrderTracking(page);});
test('External media stays blocked before refusal and stops after withdrawal of consent',async({page})=>{test.setTimeout(90000);await verifyConsent(page);});
test('Necessary storage only uses information without a false consent request',async({page})=>verifyNecessaryOnlyConsent(page));
test('Guest withdrawal accepts an unknown contract and returns a private durable receipt',async({page})=>{test.setTimeout(90000);await verifyWithdrawal(page);});
if(process.env.E2E_COMMERCE_ACTIVATION_SCENARIO)test('Activation matrix closes sales and retains history and rights',async({page})=>{test.setTimeout(90000);await verifySuspendedCommerce(page);});

test.describe('Store touch interaction',()=>{
 test.use({hasTouch:true,isMobile:true,viewport:{width:375,height:812}});
 test('Touch cart opens inside the viewport without keyboard focus decoration',async({page})=>{await page.goto('/store');await addCatalogProduct(page,undefined,true);const cart=page.getByRole('button',{name:/Panier/});await expect(page.getByRole('dialog',{name:'Panier',exact:true})).toBeVisible();expect(await cart.evaluate(e=>e.matches(':focus-visible'))).toBe(false);await page.getByRole('dialog',{name:'Panier',exact:true}).getByRole('button',{name:'Fermer',exact:true}).tap();await expect(page.getByRole('dialog',{name:'Panier',exact:true})).toBeHidden();});
});
