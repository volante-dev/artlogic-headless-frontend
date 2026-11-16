import {expect,type Page} from '@playwright/test';
export async function verifyCatalogCart(page:Page){
 await page.goto('/store');await expect(page.getByRole('heading',{name:/Store/})).toBeVisible();
 const cart=page.getByRole('button',{name:/Panier/});await expect(cart).toContainText('0');
 await page.getByRole('button',{name:'Ajouter au panier'}).first().click();
 const popover=page.getByRole('dialog',{name:'Panier'});await expect(popover).toBeVisible();await expect(cart).toContainText('1');
 await page.keyboard.press('Escape');await expect(popover).toBeHidden();await page.reload();await expect(cart).toContainText('1');
 await cart.click();await page.getByRole('button',{name:'Retirer'}).first().click();await expect(cart).toContainText('0');
}
export async function verifyRejectedAndStaleCart(page:Page){
 await page.goto('/store');
 let n=0;
 await page.route('**/api/store/cart/validate',async route=>{
  const body=route.request().postDataJSON();n++;
  if(n===1)await new Promise(resolve=>setTimeout(resolve,250));
  await route.fulfill({json:{cartRevision:body.cartRevision,currency:'EUR',lines:body.items.map((i:{productId:string;quantity:number})=>({productId:i.productId,requestedQuantity:i.quantity,maxPurchasableQuantity:1,status:i.quantity>1?'insufficient':'valid',grossUnitAmount:2000}))}});
 });
 await page.getByRole('button',{name:'Ajouter au panier'}).first().click();
 const cart=page.getByRole('button',{name:/Panier/});await expect(cart).toContainText('1');
 const quantity=page.getByRole('spinbutton',{name:'Quantité'}).first();await quantity.fill('2');await quantity.press('Enter');await expect(cart).toContainText('1');
  await expect(page.getByRole('dialog',{name:'Panier'}).getByRole('alert')).toBeVisible();
}
