import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
const site=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
test('a bundle delayed beyond ten seconds still enters the normal modal',async({page})=>{
 test.setTimeout(60000);let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});await page.route('**/_next/static/**/*.js',async r=>{await gate;await r.continue();});
 const navigation=page.goto('/artworks/'+site().finaleArtworkIds[3],{waitUntil:'commit'});await navigation;await page.waitForTimeout(11000);
 expect(await page.locator('html').getAttribute('data-artwork-document')).toBe('preparing');await expect(page.locator('[data-document-description]')).not.toBeVisible();release();
 await expect(page.getByTestId('artwork-experience')).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:20000});
});
test('confirmed application script failure exposes the same native document',async({page})=>{
 await page.route('**/_next/static/**/*.js',r=>r.abort());await page.goto('/artworks/'+site().finaleArtworkIds[3],{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-artwork-readable]')).toBeVisible();await expect(page.locator('[data-document-provenance]')).toBeVisible();const contact=page.locator('[data-artwork-readable] a[href*="/contact?artwork="]');await contact.scrollIntoViewIfNeeded();await expect(contact).toBeInViewport();await expect(page.locator('[data-artwork-experience]')).toHaveCount(0);
});
test('bootstrap blocked on its own leaves a usable native document',async({page})=>{
 await page.route('**/artworks/**',async r=>{if(r.request().resourceType()!=='document')return r.continue();const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/<script[^>]*data-artwork-document-boot[^>]*>[\s\S]*?<\/script>/g,'')});});
 await page.goto('/artworks/'+site().finaleArtworkIds[3]);await expect(page.locator('[data-document-provenance]')).toBeVisible();const contact=page.locator('[data-artwork-readable] a[href*="/contact?artwork="]');await contact.scrollIntoViewIfNeeded();await expect(contact).toBeInViewport();await expect(page.locator('[data-artwork-experience]')).toHaveCount(0);
});
test('an early hidden document is cancelled and visible return reloads the same address',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});await page.route('**/_next/static/**/*.js',async r=>{await gate;await r.continue().catch(()=>undefined);});
 const path='/artworks/'+site().finaleArtworkIds[3];await page.goto(path,{waitUntil:'commit'});await expect(page.locator('html')).toHaveAttribute('data-artwork-document','preparing');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('html')).toHaveAttribute('data-artwork-document','cancelled');
 const address=page.url(),navigation=page.waitForRequest(r=>r.isNavigationRequest()&&r.url()===address);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});release();await navigation;
 await expect(page.getByTestId('artwork-experience')).toHaveAttribute('data-artwork-opening-phase','complete');
});
