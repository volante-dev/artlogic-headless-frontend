import{createRequire}from'node:module';
import{test,expect}from'@playwright/test';
const origin=process.env.E2E_BASE_URL!;
const require=createRequire(new URL('../../backend/package.json',import.meta.url));
const decode=require('sharp') as (bytes:Buffer)=>{metadata():Promise<{width:number;height:number;format:string}>};
test('receives physical responsive pixels directly and routes HEAD without binary transfer',async({browser})=>{
 for(const dpr of [1,2,3]){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:dpr}),page=await context.newPage();const received:Promise<{width:number;height:number;expected:number;terminal:boolean}>[]=[];
  page.on('response',r=>{if(r.url().includes('/storage/v1/render/image/sign/'))received.push((async()=>{const u=new URL(r.url()),claims=JSON.parse(Buffer.from(u.searchParams.get('token')!.split('.')[1]!,'base64url').toString('utf8')),t=Object.fromEntries(claims.transformations.split(',').map((v:string)=>v.split(':')));return{...await decode(await r.body()).metadata(),expected:Number(t.width),terminal:r.status()===200};})());});
  try{await page.goto(origin+'/artworks');const first=page.locator('[data-artwork-card] img').first();await expect(first).toHaveAttribute('srcset',/image=r1-w/);await expect.poll(()=>first.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);await page.waitForTimeout(200);
   const results=await Promise.all(received);expect(results.length).toBeGreaterThan(0);expect(results.every(x=>x.terminal&&x.width===x.expected)).toBe(true);
   const src=await first.getAttribute('src');expect(src).not.toContain('displayId');expect(src).not.toContain('/_next/image');const head=await context.request.head(origin+src!);expect(head.status()).toBe(200);expect(head.headers()['content-length']).toBeUndefined();expect((await head.body()).length).toBe(0);
   const document=await page.evaluate(()=>{Reflect.set(window,'responsiveDocument','retained');return location.pathname;});await page.setViewportSize({width:768,height:900});expect(await page.evaluate(()=>Reflect.get(window,'responsiveDocument'))).toBe('retained');expect(await page.evaluate(()=>location.pathname)).toBe(document);
  }finally{await context.close();}
 }
});
