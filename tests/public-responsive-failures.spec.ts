import{test,expect}from'@playwright/test';
test('fails locally, retries reference once and sends observations through the real proxy',async({page})=>{
 const statuses:number[]=[];page.on('response',r=>{if(r.url().endsWith('/api/image-observations'))statuses.push(r.status());});let failures=0;
 // Fault injection targets only rendition loads, never the diagnostics endpoints.
 await page.route(/\/media\/[a-f0-9-]{36}\?image=/,async route=>{failures++;await route.fulfill({status:503,body:''});});
 await page.goto('/artworks');const image=page.locator('[data-artwork-card] img').first();await expect(image).toHaveAttribute('src',/retry=1/);await expect(image).not.toHaveAttribute('srcset',/.+/);await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);await expect.poll(()=>statuses.length).toBeGreaterThan(0);expect(statuses.every(x=>x===204)).toBe(true);expect(failures).toBeGreaterThan(0);await expect(page.locator('main')).toBeVisible();
});
