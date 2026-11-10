import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
test('hidden, foreign and unavailable artworks never become readable documents',async({page,request})=>{
 const sites=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites,site=sites[0],control=(data:object)=>request.post(site.controlUrl,{headers:{'x-test-control':site.controlKey},data});
 try{await control({action:'visibility',artworkId:site.artworkId,decision:'hidden'});const denied=await request.get(site.siteOrigin+'/artworks/'+site.artworkId);expect(denied.status()).toBe(404);expect(await denied.text()).not.toContain('data-artwork-readable');
  if(sites[1]){const foreign=await request.get(sites[1].siteOrigin+'/artworks/99999999-9999-4999-8999-999999999999');expect(foreign.status()).toBe(404);}
  await control({action:'restore'});await control({action:'outage',kind:'experience'});const failure=await request.get(site.siteOrigin+'/artworks/'+site.artworkId);expect([200,503]).toContain(failure.status());expect(await failure.text()).not.toContain('data-artwork-readable');const apiFailure=await request.get(site.apiOrigin+'/v1/public/artwork-experiences/'+site.artworkId+'?locale=fr');expect(apiFailure.status()).toBe(503);await page.goto('/artworks/'+site.artworkId);await expect(page.locator('[data-artwork-route-state="error"]')).toBeVisible();await expect(page.locator('[data-artwork-readable]')).toHaveCount(0);
 }finally{await control({action:'restore'});}
});
test('a refused browser validation cannot restore the initial document',async({page})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];await page.route('**/api/artwork-experiences/**',r=>r.fulfill({status:404,contentType:'application/json',body:'{"error":{"code":"not_found"}}'}));
 await page.goto('/artworks/'+site.finaleArtworkIds[3]);await expect(page.locator('[data-artwork-route-state="unavailable"]')).toBeVisible();await expect(page.locator('[data-artwork-readable]')).toHaveCount(0);await page.evaluate(()=>{window.dispatchEvent(new Event('error'));});await expect(page.locator('[data-artwork-readable]')).toHaveCount(0);
});
