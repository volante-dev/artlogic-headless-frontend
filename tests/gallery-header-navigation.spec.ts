import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test.skip(!process.env.E2E_GALLERY_FIXTURE,'Requires the isolated gallery harness');
const fixture=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
test('an accepted header departure disposes an artwork visit without a competing restoration',async({page})=>{
 await page.goto('/artworks');await page.getByTestId('artwork-card').getByRole('link').first().click();await expect(page.getByRole('dialog').getByTestId('artwork-experience')).toBeVisible();
 await page.evaluate(()=>Object.assign(window,{headerDocument:'same'}));const before=await page.evaluate(()=>history.length);
 // The existing full-screen modal intentionally covers the header. Exercise its departure coordination directly.
 await page.locator('header a[href="/contact"]').evaluate(node=>(node as HTMLAnchorElement).click());
 await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('main')).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(await page.evaluate(()=>history.length)).toBe(before+1);expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('same');
 expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');await expect(page.locator('main')).not.toHaveAttribute('inert','');
});
test('a header return to artworks reads current publication decisions',async({page,request})=>{
 const site=fixture(),control=(data:object)=>request.post(site.controlUrl,{headers:{'x-test-control':site.controlKey},data});
 try{
  await page.goto('/artworks');await expect(page.getByTestId('artwork-card')).not.toHaveCount(0);
  await page.locator('header a[href="/contact"]').click();await expect(page.locator('main')).toBeVisible();await control({action:'empty'});
  await page.goBack();await expect(page.locator('main')).toBeVisible();await expect(page.getByTestId('artwork-card').filter({visible:true})).toHaveCount(0);
 }finally{await control({action:'restore'});}
});
test('cancelling a header departure preserves the existing contact draft and focus',async({page})=>{
 await page.goto('/en/contact');const name=page.getByRole('textbox',{name:'Name',exact:true});await name.fill('Synthetic draft');await name.focus();
 page.once('dialog',dialog=>dialog.dismiss());await page.locator('header a[href="/en/artworks"]').click();await expect(page).toHaveURL(/\/en\/contact$/);await expect(name).toHaveValue('Synthetic draft');await expect(page.locator('main:visible')).toBeVisible();await expect(page.locator('[data-header-status]')).toHaveCount(0);
});
test('header destinations remain on each configured synthetic origin',async({page})=>{
 const sites=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites;
 expect(sites.length).toBeGreaterThanOrEqual(2);
 for(const site of sites){await page.goto(site.siteOrigin);await page.evaluate(()=>Object.assign(window,{originHeaderDocument:'same'}));await page.locator('header a[href="/contact"]').click();await expect(page).toHaveURL(site.siteOrigin+'/contact');await expect(page.locator('main')).toBeVisible();expect(await page.evaluate(()=>Reflect.get(window,'originHeaderDocument'))).toBe('same');}
});
test('an unavailable presentation leaves a local error and usable header, then recovers',async({page,request})=>{
 const site=fixture(),control=(data:object)=>request.post(site.controlUrl,{headers:{'x-test-control':site.controlKey},data});
 try{
  await page.goto('/');await page.evaluate(()=>Object.assign(window,{errorHeaderDocument:'same'}));await control({action:'outage',kind:'presentation'});
  await page.locator('header a[href="/expertise"]').click();await expect(page.locator('[data-header-status][role="alert"]')).toBeVisible({timeout:15000});await expect(page.locator('header')).toBeVisible();await expect(page.locator('main')).toBeHidden();
  await control({action:'outage',kind:'none'});await page.locator('[data-header-status]').getByRole('button',{name:'Réessayer'}).click();await expect(page.locator('main')).toBeVisible();await expect(page).toHaveURL(/\/expertise$/);expect(await page.evaluate(()=>Reflect.get(window,'errorHeaderDocument'))).toBe('same');
 }finally{await control({action:'restore'});}
});
test('leaving an immersive article through the header releases the document scroll lock',async({page})=>{
 const site=fixture();test.skip(!site.focusArticlePath||!process.env.E2E_HEADER_IMMERSIVE,'Requires --focus --header-immersive fixture');
 await page.goto(site.focusArticlePath);await expect(page.locator('[data-editorial-eligible]')).toBeVisible({timeout:20000});
 await page.locator('header a[href="/contact"]').click();await expect(page.locator('main:visible')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
});
