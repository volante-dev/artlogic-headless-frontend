import {test,expect} from "@playwright/test";
test.use({trace:"off",screenshot:"off",video:"off"});
test("the native reader downloads real image bytes through its configured CSP without JavaScript",async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});try{
  const page=await context.newPage(),response=await page.goto('/publications/etude-editoriale-1?reader=native');expect(response?.status()).toBe(200);
  const csp=response!.headers()['content-security-policy'];expect(csp).toContain("default-src 'none'");expect(csp).not.toContain('*');expect(csp).toContain("frame-ancestors 'none'");
  const img=page.locator('img').first();await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
  expect(await page.locator('script,iframe,[inert]').count()).toBe(0);const src=await img.getAttribute('src');expect(new URL(src!,page.url()).origin).toBe(new URL(page.url()).origin);expect(src).not.toContain('X-Amz');
 }finally{await context.close();}
});
