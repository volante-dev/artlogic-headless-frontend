import {readFile} from 'node:fs/promises';
import {expect,type Page} from '@playwright/test';

/** Fifty local projections, no supplier, inventory or image transformation calls. */
export async function verifyLargeCart(page:Page){
 const path=process.env.E2E_COMMERCE_TRACKING_FIXTURE;if(!path)throw new Error('synthetic_tracking_fixture_required');
 const {siteId}=JSON.parse(await readFile(path,'utf8'));
 const response=await page.request.get('/api/store/products/32000000-0000-4000-8000-000000000001?locale=fr');expect(response.ok()).toBe(true);const product=await response.json();
 const items=Array.from({length:50},(_,i)=>({productId:'32000000-0000-4000-8000-'+String(1000+i).padStart(12,'0'),quantity:1}));
 await page.route('**/api/store/products/*',async route=>{const id=new URL(route.request().url()).pathname.split('/').at(-1);await route.fulfill({json:{...product,id,title:'Catalogue de collection '+('TrèsLongTitreSansCésure'.repeat(8))}});});
 await page.route('**/api/store/cart/validate',async route=>{const body=route.request().postDataJSON();await route.fulfill({json:{cartRevision:body.cartRevision,currency:'EUR',lines:body.items.map((i:{productId:string;quantity:number})=>({...i,requestedQuantity:i.quantity,maxPurchasableQuantity:99,status:'valid',grossUnitAmount:2000}))}});});
 await page.addInitScript(({siteId,items})=>localStorage.setItem('commerce:cart:'+siteId,JSON.stringify({version:1,items,expiresAt:Date.now()+86400000})),{siteId,items});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/store');
 const cart=page.getByRole('button',{name:/Panier/});await expect(cart).toContainText('50');await expect(page.getByRole('button',{name:'Détails',exact:true}).first()).toBeEnabled();await cart.click();
 const dialog=page.getByRole('dialog',{name:'Panier',exact:true});await expect(dialog).toBeVisible();await expect(dialog.getByRole('listitem')).toHaveCount(50);
 expect(await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight+1;})).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await dialog.evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');
 await dialog.getByRole('link',{name:'Commander',exact:true}).focus();await expect(dialog.getByRole('link',{name:'Commander',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(cart).toBeFocused();
 await page.keyboard.press('Tab');await cart.focus();await expect(cart).toBeFocused();
 if(page.context().browser()?.browserType().name()==='chromium'){
  expect(await cart.evaluate(e=>e.matches(':focus-visible'))).toBe(true);
  await page.mouse.click(1,1);await cart.click();expect(await cart.evaluate(e=>e.matches(':focus-visible'))).toBe(false);
 }
}
