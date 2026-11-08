import{test,expect}from'@playwright/test';
test.setTimeout(120000);
test('rolls back the frontend while keeping existing responsive aliases and direct transport available',async({page,request})=>{
 const mode=async(value:string)=>{const r=await request.post(process.env.E2E_CONTROL_URL+'/control',{headers:{'X-Test-Control':process.env.E2E_CONTROL_KEY!},data:{action:'responsive-mode',mode:value}});expect(r.ok()).toBe(true);};
 await page.goto('/artworks');const image=page.locator('[data-artwork-card] img').first();await expect(image).toHaveAttribute('srcset',/image=r1-/);await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);const alias=(await image.getAttribute('src'))!;
 try{await page.goto('about:blank');await mode('disabled');const openPageAlias=await request.get(alias,{maxRedirects:0});expect(openPageAlias.status()).toBe(307);expect((await openPageAlias.body()).length).toBe(0);
  await page.goto('/artworks');await expect(page.locator('body')).not.toHaveAttribute('data-public-responsive','true');const legacy=page.locator('[data-artwork-card] img').first();await expect(legacy).not.toHaveAttribute('srcset',/image=r1-/);await expect.poll(()=>legacy.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }finally{await page.goto('about:blank');await mode('enabled');}
 await page.goto('/artworks');await expect(page.locator('body')).toHaveAttribute('data-public-responsive','true');
});
