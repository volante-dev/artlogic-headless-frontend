import{test,expect}from'@playwright/test';
test('optimizes the hero poster, selection and active logo while preserving video sources',async({page,request})=>{
 await page.goto('/');const hero=page.getByTestId('hero-media'),poster=hero.locator('img');await expect(poster).toHaveAttribute('srcset',/image=r1-/);await expect.poll(()=>poster.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const video=hero.locator('video');await expect(video).toHaveAttribute('preload','auto');await expect(video).not.toHaveAttribute('poster',/.+/);expect(await video.locator('source').count()).toBeGreaterThan(0);expect(await video.locator('source').last().getAttribute('src')).not.toContain('image=');
 const selection=page.locator('[data-artwork-selection] img').first();await expect(selection).toHaveAttribute('srcset',/image=r1-/);await selection.scrollIntoViewIfNeeded();await expect.poll(()=>selection.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const control=await request.post(process.env.E2E_CONTROL_URL+'/control',{headers:{'X-Test-Control':process.env.E2E_CONTROL_KEY!},data:{action:'logo'}});expect(control.ok()).toBe(true);
 const white=await request.post(process.env.E2E_CONTROL_URL+'/control',{headers:{'X-Test-Control':process.env.E2E_CONTROL_KEY!},data:{action:'logo-white'}});expect(white.ok()).toBe(true);const whiteId=(await white.json()).logoId;
 await page.reload();const logo=page.getByTestId('site-logo').first();await expect(logo).toHaveAttribute('srcset',/image=r1-/);await expect.poll(()=>logo.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const descriptors=await page.evaluate(async id=>{const r=await fetch('/api/image-descriptors/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resources:[{resourceKind:'siteLogo',resourceId:id}]})});return r.json();},whiteId);expect(descriptors.items[0].availability).toBe('available');
 // The immersive home header uses the alternate active logo; the menu uses the ordinary one.
 const ids=await page.getByTestId('site-logo').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-public-image-resource')));expect(ids).toContain('siteLogo:'+whiteId);
});
