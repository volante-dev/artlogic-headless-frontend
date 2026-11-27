import {test,expect} from '@playwright/test';
test('redirects UUID and legacy directly to the final address, with no inverse redirect',async({request})=>{
 const page=await request.get('/api/artwork-catalog?locale=fr&pageSize=1',{headers:{'X-Artwork-Address-Contract':'1'}});expect(page.ok()).toBe(true);const body=await page.json(),art=body.items[0],a=body.artworkAddresses.items[0];
 for(const ref of [art.id,art.slug]){const response=await request.get('/fr/artworks/'+ref,{maxRedirects:0});expect(response.status()).toBe(308);expect(new URL(response.headers().location,response.url()).pathname).toBe(a.canonicalPath);}
 const final=await request.get(a.canonicalPath,{maxRedirects:0});expect(final.status()).toBe(200);expect(final.headers().location).toBeUndefined();
 const hidden=await request.get('/artworks/ffffffff-ffff-4fff-8fff-ffffffffffff',{maxRedirects:0});expect(hidden.status()).toBe(404);expect(hidden.headers().location).toBeUndefined();
});
