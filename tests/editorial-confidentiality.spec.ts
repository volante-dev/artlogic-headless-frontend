import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
test.skip(!process.env.E2E_EDITORIAL_FIXTURE,"Requires the isolated public editorial harness.");test.setTimeout(90000);test.use({actionTimeout:15000});
test("refuses drafts before streaming and omits private and preparatory URLs from metadata and sitemap",async({page,request})=>{
 for(const path of ["/publications/etude-editoriale-3","/fr/publications/etude-editoriale-3","/de/publications/etude-editoriale-1"]){const response=await page.goto(path);expect(response!.status()).toBe(404);expect(await response!.text()).not.toContain("Étude éditoriale 3");await expect.poll(()=>page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>(node.getAttribute("content")??"").includes("noindex")))).toBe(true);}
 await page.goto("/publications/etude-editoriale-1");await expect(page).toHaveTitle(/Étude éditoriale 1/);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",/\/publications\/etude-editoriale-1$/);await expect(page.locator('link[hreflang="de"]')).toHaveCount(0);
 const sitemap=await request.get("/sitemap.xml");expect(sitemap.status()).toBe(200);const body=await sitemap.text();expect(body).toContain("/publications/etude-editoriale-1");expect(body).not.toMatch(/etude-editoriale-3|\/de\/|\/preview\/|storageKey|exchangeCode/);
 expect((await request.get("/api/editorial/articles?kind=publication&locale=fr&siteId=foreign")).status()).toBe(400);
});
test("redirects media without bytes, lets Storage serve HEAD/Range and never signs a private-only asset",async({request})=>{
 const fixture=JSON.parse(await readFile(process.env.E2E_EDITORIAL_FIXTURE+"/fixture.json","utf8")),path="/editorial-assets/"+fixture.imageId;
 const response=await request.get(path,{maxRedirects:0});expect(response.status()).toBe(307);expect((await response.body()).length).toBe(0);expect(response.headers()["cache-control"]).toContain("no-store");expect(response.headers()["referrer-policy"]).toBe("no-referrer");expect((await request.head(path,{maxRedirects:0})).status()).toBe(307);
 const terminal=await request.get(response.headers().location!,{headers:{Range:"bytes=0-63"}});expect(terminal.status()).toBe(206);expect((await terminal.body()).length).toBe(64);expect(terminal.headers()["content-range"]).toMatch(/^bytes 0-63\//);
 expect((await request.get("/editorial-assets/"+fixture.privateAssetId,{maxRedirects:0})).status()).toBe(404);
});
