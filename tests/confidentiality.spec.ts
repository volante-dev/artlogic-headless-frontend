import {test,expect} from "@playwright/test";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {fixture} from "./helpers";
test("keeps service secrets out of bundles, HTML/RSC, metadata, storage and browser requests",async({page,request})=>{
  const data=fixture(),requests:string[]=[];page.on("request",r=>requests.push(r.url()+JSON.stringify(r.headers())+(r.postData()??"")));
  const artifacts:string[]=[];
  async function scan(dir:string){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await scan(path);else if(entry.name.endsWith(".js"))artifacts.push(await readFile(path,"utf8"));}}
  await scan(".next/static");
  for(const path of ["/","/artworks/"+data.published[0]!.id]){
    const response=await request.get(path);expect(response.headers()["cache-control"]).toContain("no-store");artifacts.push(await response.text());
    const rsc=await request.get(path+"?_rsc=confidentiality",{headers:{RSC:"1"}});expect(rsc.headers()["cache-control"]).toContain("no-store");artifacts.push(await rsc.text());
    await page.goto(path);await expect(page.getByRole("heading",{level:1})).toBeVisible();artifacts.push(await page.content());
  }
  artifacts.push(await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}})),...requests);
  expect(data.secrets.some(secret=>artifacts.some(body=>body.includes(secret))),"service secret or private storage key leaked").toBe(false);
  expect(requests.some(url=>[data.sourceOrigin,data.identityOrigin,data.backendOrigin,"supabase"].some(value=>url.startsWith(value)))).toBe(false);
  expect(await page.evaluate(async()=>await caches.keys())).toEqual([]);
});
test("does not disclose a hidden artwork through direct HTML, RSC, metadata or image requests",async({request})=>{
  const data=fixture();for(const suffix of ["","?_rsc=hidden"]){const response=await request.get("/artworks/"+data.hiddenId+suffix,{headers:suffix?{RSC:"1"}:{}});expect(response.status()).toBe(404);expect(response.headers()["cache-control"]).toContain("no-store");expect((await response.text()).includes(data.hiddenTitle)).toBe(false);}
  expect((await request.get("/media/"+data.hiddenMediaId)).status()).toBe(404);
});
