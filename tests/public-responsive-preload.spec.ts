import{test,expect}from'@playwright/test';
test('uses exactly the same responsive declaration for detail preload and first photo',async({page})=>{
 await page.goto('/artworks');const href=await page.locator('[data-artwork-card] a').first().getAttribute('href');expect(href).toBeTruthy();await page.goto("about:blank");await page.goto(href!);
 const preload=page.locator('link[rel="preload"][as="image"][imagesrcset*="image=r1-"]').first();await expect(preload).toHaveAttribute('imagesizes',/max\(/);
 const image=page.locator('[data-artwork-experience] img[data-testid="artwork-image"]').first();await expect(image).toHaveAttribute('srcset',(await preload.getAttribute('imagesrcset'))!);await expect(image).toHaveAttribute('sizes',(await preload.getAttribute('imagesizes'))!);await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
