import{test,expect}from'@playwright/test';
import{readFile}from'node:fs/promises';
test.skip(!process.env.E2E_EDITORIAL_FIXTURE,'Requires the isolated editorial harness.');test.setTimeout(90000);
test('renders editorial images responsively and preserves native no-JS, CSP, old links and private denial',async({page,browser,request})=>{
 const fixture=JSON.parse(await readFile(process.env.E2E_EDITORIAL_FIXTURE+'/fixture.json','utf8'));
 const batches:Promise<{status:number;availability:unknown}[] >[]=[];page.on('response',r=>{if(r.url().endsWith('/api/image-descriptors/query'))batches.push(r.json().then(v=>[{status:r.status(),availability:v.items?.map((i:{availability:string})=>i.availability)}]).catch(()=>[{status:r.status(),availability:null}]));});
 await page.goto('/publications/etude-editoriale-1');const image=page.locator('img[data-public-image-resource]').first();await expect(image).toHaveAttribute('srcset',/image=r1-/).catch(async e=>{console.log(JSON.stringify({descriptorBatches:await Promise.all(batches)}));throw e;});await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const response=await request.get('/publications/etude-editoriale-1?reader=native');expect(response.status()).toBe(200);const html=await response.text();expect(html).toContain('srcset=');expect(html).not.toContain('<script');expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
 const context=await browser.newContext({javaScriptEnabled:false});try{const native=await context.newPage();await native.goto(process.env.E2E_BASE_URL+'/publications/etude-editoriale-1?reader=native');const img=native.locator('img').first();await expect.poll(()=>img.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}finally{await context.close();}
 const privatePath='/editorial-assets/'+fixture.privateAssetId;expect((await request.get(privatePath,{maxRedirects:0})).status()).toBe(404);expect((await request.get(privatePath+'?image=r1-reference&v='+fixture.privateAssetId+'.original',{maxRedirects:0})).status()).toBe(404);
 const legacy=await request.get('/editorial-assets/'+fixture.imageId,{maxRedirects:0});expect(legacy.status()).toBe(307);expect((await legacy.body()).length).toBe(0);
});
