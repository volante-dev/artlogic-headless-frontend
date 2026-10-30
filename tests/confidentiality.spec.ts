import {test,expect} from "@playwright/test";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {fixture} from "./helpers";
test("keeps service secrets out of bundles, HTML/RSC, metadata, storage and browser requests",async({page,request})=>{
  const data=fixture(),requests:string[]=[];page.on("request",r=>requests.push(r.url()+JSON.stringify(r.headers())+(r.postData()??"")));
  const artifacts:string[]=[];
  async function scan(dir:string){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await scan(path);else if(entry.name.endsWith(".js"))artifacts.push(await readFile(path,"utf8"));}}
  await scan(".next/static");
  for(const path of ["/","/en","/news","/en/news","/artworks/"+data.published[0]!.id,"/en/artworks/"+data.published[0]!.id]){
    const response=await request.get(path);expect(response.headers()["cache-control"]).toContain("no-store");artifacts.push(await response.text());
    const rsc=await request.get(path+"?_rsc=confidentiality",{headers:{RSC:"1"}});expect(rsc.headers()["cache-control"]).toContain("no-store");artifacts.push(await rsc.text());
    await page.goto(path);await expect(page.getByRole("heading",{level:1})).toBeVisible();artifacts.push(await page.content());
  }
  artifacts.push(await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}})));
  expect([...data.secrets,...data.presentation.privateMarkers].some(secret=>artifacts.some(body=>body.includes(secret))),"service secret or private storage key leaked").toBe(false);
  expect([...data.secrets,...data.presentation.privateMarkers.filter(value=>!data.presentation.deliveryStorageKeys.includes(value))].some(secret=>requests.some(body=>body.includes(secret))),"service secret or private data leaked in network").toBe(false);
  expect(requests.some(url=>[data.sourceOrigin,data.identityOrigin,data.backendOrigin,"supabase"].some(value=>url.startsWith(value)))).toBe(false);
  expect(await page.evaluate(async()=>await caches.keys())).toEqual([]);
});
test("does not disclose a hidden artwork through direct HTML, RSC, metadata or image requests",async({request})=>{
  const data=fixture();for(const prefix of ["","/en"])for(const suffix of ["","?_rsc=hidden"]){const response=await request.get(prefix+"/artworks/"+data.hiddenId+suffix,{headers:suffix?{RSC:"1"}:{}});expect(response.status()).toBe(404);expect(response.headers()["cache-control"]).toContain("no-store");expect((await response.text()).includes(data.hiddenTitle)).toBe(false);}
  expect((await request.get("/media/"+data.hiddenMediaId)).status()).toBe(404);
});

test("preview HTML/RSC and media reject copied authority without cache or size disclosure",async({request})=>{
  const data=fixture(),headers={"x-preview-key":"forged","x-preview-session":"forged","x-bff-key":"forged","x-admin-session":"forged"};
  for(const path of ["/preview","/preview/render/fr","/preview/render/en/artworks"]){
    for(const rsc of [false,true]){const response=await request.get(path+(rsc?"?_rsc=private":""),{headers:{...headers,...(rsc?{RSC:"1"}:{})}});expect(response.headers()["cache-control"]).toContain("no-store");const body=await response.text();for(const marker of data.presentation.privateMarkers)expect(body).not.toContain(marker);}
  }
  for(const method of ["GET","HEAD"])for(const id of ["11111111-1111-4111-8111-111111111111",data.presentation.assets.poster.split("/").at(-1)!.split("?")[0]]){
    const response=await request.fetch("/preview/assets/"+id,{method,headers:{...headers,Range:"bytes=999999999-"}});expect(response.status()).toBe(401);expect(response.headers()["cache-control"]).toContain("no-store");expect(response.headers()["content-range"]).toBeUndefined();
  }
  for(const origin of [undefined,"https://attacker.invalid"])for(const path of ["/preview/exchange","/preview/session"]){const response=await request.fetch(path,{method:path.endsWith("exchange")?"POST":"DELETE",headers:{...(origin?{origin}:{}),"content-type":"application/x-www-form-urlencoded"},data:path.endsWith("exchange")?"code="+"x".repeat(43):undefined});expect(response.status()).toBe(403);expect(response.headers()["cache-control"]).toContain("no-store");}
});
