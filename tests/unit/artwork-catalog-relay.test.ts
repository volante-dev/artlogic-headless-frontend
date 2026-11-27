vi.mock('@/lib/i18n/runtime-policy',()=>({readRuntimeLanguagePolicy:async()=>({kind:'legacy'})}));
import {beforeEach,expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
const api=vi.hoisted(()=>({fetch:vi.fn()}));
vi.mock("@/lib/api/client",async original=>({...await original<typeof import("@/lib/api/client")>(),publicFetch:api.fetch}));
vi.mock("@/lib/config/env",()=>({loadConfig:()=>({}),configuredLocalePolicy:()=>({defaultLocale:"fr",locales:[{code:"fr"},{code:"en"}]})}));
import {NextRequest} from "next/server";
import {proxy} from "@/proxy";
import {isTechnicalPath} from "@/lib/i18n/routes";
import {GET} from "@/app/api/artwork-catalog/route";
import {infiniteCatalogPage} from "../fixtures/infinite-catalog";
beforeEach(()=>api.fetch.mockReset());
it("negotiates card focus only for new browser requests",async()=>{
 api.fetch.mockResolvedValue(Response.json(infiniteCatalogPage(2)));
 const old=await GET(new Request("http://gallery.test/api/artwork-catalog?locale=fr&page=2"));
 expect((await old.json()).items[0]).not.toHaveProperty("heroFocus");
 expect(api.fetch.mock.calls[0]?.[2]).toEqual({cardFocus:false,artworkAddresses:false});
 await GET(new Request("http://gallery.test/api/artwork-catalog?locale=fr&page=2",{headers:{"X-Artwork-Card-Focus":"1"}}));
 expect(api.fetch.mock.calls[1]?.[2]).toEqual({cardFocus:true,artworkAddresses:false});
});
const call=(query:string)=>GET(new Request("http://gallery.test/api/artwork-catalog?"+query,{headers:{cookie:"admin=PRIVATE","X-BFF-Key":"FORGED"}}));
it("uses the fixed public projection, query, types, revision and request cancellation",async()=>{
 api.fetch.mockResolvedValue(Response.json(infiniteCatalogPage(2,"Étude")));const result=await call("locale=fr&q=%C3%89tude&page=2&pageSize=18&catalogRevision=1&types=7,9");
 expect(result.status).toBe(200);expect((await result.json()).page).toBe(2);const [path,signal]=api.fetch.mock.calls[0]!;
 expect(path).toBe("/v1/public/artwork-catalog?includeTypes=1&types=7%2C9&q=%C3%89tude&page=2&pageSize=18&catalogRevision=1&locale=fr&display=plp");expect(signal).toBeInstanceOf(AbortSignal);
});
it("rejects invalid languages, duplicate selectors, cursor mode and arbitrary upstream targets",async()=>{
 for(const query of ["locale=de","locale=fr&locale=en","locale=fr&page=2&page=3","locale=fr&cursor=abc","locale=fr&backendUrl=http://evil","locale=fr&pageSize=101"]){expect((await call(query)).status).toBe(400);}expect(api.fetch).not.toHaveBeenCalled();
});
it("does not expose malformed or private upstream content and preserves catalogue conflicts",async()=>{
 api.fetch.mockResolvedValueOnce(Response.json({...infiniteCatalogPage(2),draft:"PRIVATE"}));const bad=await call("locale=fr&page=2");expect(bad.status).toBe(503);expect(await bad.text()).not.toContain("PRIVATE");
 api.fetch.mockResolvedValueOnce(Response.json({error:{code:"catalog_changed",message:"PRIVATE"}},{status:409}));const conflict=await call("locale=fr&page=2");expect(conflict.status).toBe(409);expect((await conflict.json()).error.code).toBe("catalog_changed");
});
it("preserves a bounded retry-after for rate limiting",async()=>{api.fetch.mockResolvedValueOnce(Response.json({error:{code:"rate_limited"}},{status:429,headers:{"Retry-After":"12"}}));const result=await call("locale=fr&page=2");expect(result.status).toBe(429);expect(result.headers.get("retry-after")).toBe("12");});

it("passes the exact JSON route through the proxy without localization or upstream reads",async()=>{expect(isTechnicalPath("/api/artwork-catalog")).toBe(true);expect(isTechnicalPath("/api/artwork-catalog/private")).toBe(false);const response=await proxy(new NextRequest("http://gallery.test/api/artwork-catalog?locale=en&page=2"));expect(response.headers.get("x-middleware-next")).toBe("1");expect(response.headers.get("x-middleware-rewrite")).toBeNull();expect(api.fetch).not.toHaveBeenCalled();});
