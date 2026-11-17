import {addCatalogProduct} from './product.cases';
import {readFile} from 'node:fs/promises';
import {expect,type Page} from '@playwright/test';
export async function verifyConsent(page:Page){
 const path=process.env.E2E_COMMERCE_CONSENT_FIXTURE;if(!path)throw new Error('synthetic_consent_fixture_required');const fixture=JSON.parse(await readFile(path,'utf8')),external:string[]=[];
 await page.route(/https:\/\/([^/]*\.)?(youtube(?:-nocookie)?\.com|ytimg\.com|vimeo\.com)\//,async route=>{external.push(new URL(route.request().url()).hostname);await route.abort();});
 await page.goto(fixture.path);await expect(page.getByRole('button',{name:'Tout refuser',exact:true})).toBeVisible();await expect(page.getByRole('main').getByText(/Cette vidéo YouTube reste bloquée/)).toBeVisible();await expect(page.getByRole('main').getByText(/Cette vidéo Vimeo reste bloquée/)).toBeVisible();expect(external).toEqual([]);
 await page.getByRole('button',{name:'Tout refuser',exact:true}).click();await page.reload();await expect(page.getByRole('main').getByText(/Cette vidéo YouTube reste bloquée/)).toBeVisible();expect(external).toEqual([]);await expect(page.getByRole('button',{name:'Tout accepter',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Confidentialité et cookies',exact:true}).click();await expect(page.getByRole('dialog',{name:'Préférences de confidentialité',exact:true})).toBeVisible();await page.getByRole('button',{name:'Fermer',exact:true}).click();await page.getByRole('banner').getByRole('link',{name:'Store',exact:true}).click();await addCatalogProduct(page);await expect(page.getByRole('dialog',{name:'Panier',exact:true})).toBeVisible();expect(external).toEqual([]);
 await page.goto(fixture.path);await page.getByRole('button',{name:'Confidentialité et cookies',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Préférences de confidentialité',exact:true});await dialog.getByRole('button',{name:'Tout accepter',exact:true}).click();await expect.poll(()=>external.length).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Confidentialité et cookies',exact:true}).click();await dialog.getByRole('button',{name:'Tout refuser',exact:true}).click();await expect(page.getByRole('main').getByText(/Cette vidéo YouTube reste bloquée/)).toBeVisible();await expect(page.getByRole('main').getByText(/Cette vidéo Vimeo reste bloquée/)).toBeVisible();await expect(page.locator('iframe[src*="youtube"],iframe[src*="vimeo"]')).toHaveCount(0);
 const count=external.length;await page.reload();await expect(page.getByRole('main').getByText(/Cette vidéo YouTube reste bloquée/)).toBeVisible();expect(external.length).toBe(count);
}
export async function verifyNecessaryOnlyConsent(page:Page){
 let receipts=0;page.on('request',request=>{if(request.url().endsWith('/consent-receipts'))receipts++;});
 await page.route('**/api/privacy/policy?*',route=>route.fulfill({json:{version:'synthetic-necessary-only',locale:'fr',categories:[{id:'necessary',label:'Fonctionnement nécessaire',description:'Langue, panier et sécurité.',required:true,providers:[]}],expiresInSeconds:15552000}}));
 await page.goto('/store');await expect(page.getByText(/Aucun consentement facultatif n’est demandé/)).toBeVisible();await expect(page.getByRole('button',{name:'Tout accepter',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Compris',exact:true}).click();expect(receipts).toBe(0);
}
