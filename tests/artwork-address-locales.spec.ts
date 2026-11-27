import {test,expect} from '@playwright/test';
const id='03900000-0000-4000-8000-000000000001';
test('uses effective alternate anchors, updates the mounted language and aligns the head and sitemap',async({page,request,context})=>{
 const response=await request.get('/api/artwork-experiences/'+id+'?locale=fr',{headers:{'X-Artwork-Address-Contract':'1'}});expect(response.ok()).toBe(true);const data=await response.json(),address=data.artworkAddresses.items[0],en=address.alternates.find((a:{locale:string})=>a.locale==='en');expect(en.slug).not.toBe(address.slug);
 await page.goto(address.canonicalPath);const link=page.locator('a[data-artwork-locale="en"]');await expect(link).toHaveAttribute('href',en.path);
 const other=await context.newPage();await other.goto(en.path);await expect(other.locator('h1').first()).toHaveText('Acceptance object');await other.close();
 await link.click();await expect(page).toHaveURL(new RegExp(en.path+'$'));await expect(page.locator('h1').first()).toHaveText('Acceptance object');await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href',new URL(en.path,page.url()).href);
 const html=await (await request.get(address.canonicalPath)).text(),head=html.slice(0,html.indexOf('</head>'));expect(head).toContain('href="'+new URL(address.canonicalPath,page.url()).href+'"');expect(head).toContain('href="'+new URL(en.path,page.url()).href+'"');
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.ok()).toBe(true);const xml=await sitemap.text();expect(xml).toContain(address.canonicalPath);expect(xml).toContain(en.path);expect(xml).not.toContain(data.artwork.slug);
});
