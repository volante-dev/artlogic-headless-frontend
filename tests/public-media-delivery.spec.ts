import {test,expect} from "@playwright/test";
import {control} from "./helpers";
test.use({trace:"off",screenshot:"off",video:"off"});
test("images use empty redirects and direct signed transfers without visitor SSO",async({page,request})=>{
 test.skip(process.env.E2E_PUBLIC_MEDIA_DIRECT!=="true","direct fixture required");
 const requests=new Map<string,number>();page.on('request',r=>{const u=new URL(r.url());if(u.pathname.startsWith('/media/'))requests.set(u.pathname,(requests.get(u.pathname)??0)+1);});
 const transfers:{status:number;origin:string}[]=[];page.on("response",r=>{const u=new URL(r.url());if(u.pathname.startsWith('/storage/v1/object/sign/'))transfers.push({status:r.status(),origin:u.origin});});
 await page.goto('/artworks');const images=page.getByTestId('artwork-image');await expect(images.first()).toBeVisible();
 await expect.poll(()=>images.first().evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 expect([...requests.values()].every(count=>count===1)).toBe(true);const raw=await images.first().getAttribute('src'),url=new URL(raw!,page.url()),src=url.pathname+url.search;expect(url.origin).toBe(new URL(page.url()).origin);expect(src).toMatch(/^\/media\/[0-9a-f-]+(?:\?displayId=[A-Za-z0-9_%:.\-]+)?$/);
 const response=await request.get(src!,{maxRedirects:0});expect(response.status()).toBe(307);expect((await response.body()).length).toBe(0);expect(response.headers()['cache-control']).toContain('no-store');
 const upper=src!.replace(/(\/media\/)([0-9a-f-]{36})/,(_match,prefix,id)=>prefix+id.toUpperCase());expect((await request.get(upper,{maxRedirects:0})).status()).toBe(307);
 const head=await request.head(src!);expect(head.status()).toBe(200);expect((await head.body()).length).toBe(0);
 expect(transfers.some(t=>t.status===200)).toBe(true);
 await control(request,"hide-all");try{expect((await request.get(src!,{maxRedirects:0})).status()).toBe(404);}finally{await control(request,"restore-selection");}
});
