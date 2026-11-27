import {test,expect} from '@playwright/test';
/** Fixtures are activated by the local backend harness only, never by this browser test. */
test('shares the effective address while retaining the artwork contact identity',async({page,context,request})=>{
 const response=await request.get('/api/artwork-catalog?locale=fr&pageSize=1',{headers:{'X-Artwork-Address-Contract':'1'}});expect(response.ok()).toBe(true);
 const data=await response.json();expect(data.artworkAddresses.mode).toBe('active');const art=data.items[0],address=data.artworkAddresses.items.find((a:{artworkId:string})=>a.artworkId===art.id);expect(address).toBeTruthy();
 expect(address.slug.length).toBeLessThanOrEqual(80);await page.goto('/artworks');
 const card=page.locator('a[href="'+address.canonicalPath+'"]').first();await expect(card).toBeVisible();await card.click();await expect(page).toHaveURL(new RegExp(address.canonicalPath+'(?:\\?|$)'));
 await expect(page.getByTestId('artwork-experience')).toBeVisible();
 const other=await context.newPage();await other.goto(page.url());await expect(other.getByTestId('artwork-experience')).toBeVisible();await other.close();
 const contact=page.locator('a[href*="artwork='+art.id+'"]').first();await expect(contact).toHaveAttribute('href',new RegExp('artwork='+art.id));
 await page.goBack();await expect(page).toHaveURL(/\/artworks(?:\?|$)/);
});
test('keeps the same effective artwork identity across two isolated presentations',async({page,request})=>{
 const {readFileSync}=await import('node:fs');const sites=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites;test.skip(sites.length!==2,'Requires --two-sites');expect(new Set(sites.map((s:{artworkView:string})=>s.artworkView)).size).toBe(2);
 for(const site of sites){const response=await request.get(site.siteOrigin+'/api/artwork-catalog?locale=fr&pageSize=1',{headers:{'X-Artwork-Address-Contract':'1'}});expect(response.ok()).toBe(true);const data=await response.json(),art=data.items[0],address=data.artworkAddresses.items.find((a:{artworkId:string})=>a.artworkId===art.id);
  await page.goto(site.siteOrigin+'/artworks');await page.locator('a[href="'+address.canonicalPath+'"]').first().click();await expect(page.getByTestId('artwork-experience')).toBeVisible();await expect(page.locator('a[href*="artwork='+art.id+'"]').first()).toBeVisible();await page.reload();await expect(page.getByTestId('artwork-experience')).toBeVisible();await page.goBack();await expect(page).toHaveURL(site.siteOrigin+'/artworks');
 }
});
