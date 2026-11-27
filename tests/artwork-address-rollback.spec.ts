import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test('opens a remembered permanent destination after the fixture routes API N back to bridge B',async({page,request})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];test.skip(!site.addressRollback,'Requires --address-rollback');
 const response=await request.get('/api/artwork-catalog?locale=fr&pageSize=1',{headers:{'X-Artwork-Address-Contract':'1'}}),body=await response.json(),art=body.items[0],address=body.artworkAddresses.items[0];
 const permanent=await request.get('/artworks/'+art.slug,{maxRedirects:0});expect(permanent.status()).toBe(308);const remembered=new URL(permanent.headers().location,permanent.url());expect(remembered.pathname).toBe(address.canonicalPath);await page.goto(remembered.href);await expect(page.getByTestId('artwork-experience')).toBeVisible();
 const rollback=await request.post(site.controlUrl,{headers:{'X-Test-Control':site.controlKey},data:{action:'addressRollback'}});expect(rollback.ok()).toBe(true);
 const direct=await request.get(remembered.href,{maxRedirects:0});expect(direct.status()).toBe(200);expect(direct.headers().location).toBeUndefined();await page.reload();await expect(page.getByTestId('artwork-experience')).toBeVisible();expect(new URL(page.url()).pathname).toBe(address.canonicalPath);
 await expect(page.locator('a[href*="artwork='+art.id+'"]').first()).toBeVisible();
});
