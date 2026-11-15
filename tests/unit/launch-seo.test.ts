import {beforeEach,expect,it,vi} from "vitest";
import {getRedirectUrl,unstable_getResponseFromNextConfig} from "next/experimental/testing/server";
import redirects from "../../lib/seo/legacy-redirects.json";
import {classifyRoute} from "../../lib/i18n/routes";
import {pageAlternates} from "../../lib/seo/metadata";
import nextConfig from "../../next.config";

const state=vi.hoisted(()=>({gallery:vi.fn(),editorial:vi.fn(),presentation:vi.fn(),config:{SITE_ORIGIN:"https://canonical.example",EDITORIAL_ENABLED:"true"}}));
const policy={defaultLocale:"fr",locales:[{code:"fr",label:"Français"},{code:"en",label:"English"}]};
vi.mock("next/server",()=>({connection:async()=>{}}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>state.config,stringValue:(c:Record<string,string>,k:string)=>c[k],configuredLocalePolicy:()=>policy}));
vi.mock("../../lib/api/client",()=>({PublicApiError:class extends Error {status=503;}}));
vi.mock("../../lib/presentation/client",()=>({getPublicPresentation:state.presentation}));
vi.mock("../../lib/artworks/server",()=>({getGalleryCatalog:state.gallery}));
vi.mock("../../lib/editorial/server",()=>({getEditorialPage:state.editorial}));
import sitemap from "../../app/sitemap";

beforeEach(()=>{
 vi.clearAllMocks();
 state.presentation.mockResolvedValue({releaseId:"published-release",pageIdentity:{alternatePaths:{fr:"/lucas-ratton",en:"/en/lucas-ratton"}}});
 state.gallery.mockImplementation(async({page}:{page:number})=>({items:[{slug:page===1?"published-one":"published-two"}],page,pageSize:100,pageCount:2,totalItems:101,catalogRevision:9}));
 state.editorial.mockImplementation(async(kind:string,locale:string)=>({items:[{canonicalPath:(locale==="en"?"/en":"")+"/"+({publication:"publications",news:"news",exhibition:"exhibitions"}[kind])+"/published-article"}],pageSize:48,total:1,catalogRevision:"17"}));
});

it("uses the configured origin and locale policy for canonical URLs",()=>{
 const changed={defaultLocale:"en",locales:policy.locales};
 expect(pageAlternates("/", "fr",changed,"https://other.example")).toEqual({canonical:"https://other.example/fr",languages:{fr:"https://other.example/fr",en:"https://other.example/","x-default":"https://other.example/"}});
 expect(classifyRoute("/legal",policy).kind).toBe("legal");
 expect(classifyRoute("/en/legal",policy)).toMatchObject({kind:"legal",locale:"en"});
 expect(classifyRoute("/de/legal",policy).kind).toBe("unknown");
});

it("redirects old artwork and exhibition URLs permanently, retaining campaign queries",async()=>{
 for(const [path,target] of [["/masquescollection/masque-ubi?utm_source=archive","/artworks?utm_source=archive"],["/statuaires","/artworks"],["/actualit","/exhibitions"],["/edo","/exhibitions/edo-sandra-benhamou-exposition"]]){
  const r=await unstable_getResponseFromNextConfig({url:"https://site.example"+path,nextConfig});
  expect(r.status).toBe(301);expect(getRedirectUrl(r)).toBe("https://site.example"+target);
 }
 expect(redirects).not.toHaveProperty("/contact");expect(redirects).not.toHaveProperty("/legal");
 for(const [source,target] of Object.entries(redirects)){expect(target).toMatch(/^\/(?!\/)/);expect(source).not.toBe(target);expect(Object.keys(redirects)).not.toContain(target);}
});

it("keeps previews excluded and only opens ordinary pages when the frontend switches to production",async()=>{
 try{
  vi.stubEnv("DEPLOYMENT_ENV","test");
  const previewSite=await unstable_getResponseFromNextConfig({url:"https://site.example/news",nextConfig});
  expect(previewSite.headers.get("x-robots-tag")).toContain("noindex");
  vi.stubEnv("DEPLOYMENT_ENV","production");
  const publicPage=await unstable_getResponseFromNextConfig({url:"https://site.example/news",nextConfig});
  const privatePreview=await unstable_getResponseFromNextConfig({url:"https://site.example/preview/exchange",nextConfig});
  expect(publicPage.headers.has("x-robots-tag")).toBe(false);
  expect(privatePreview.headers.get("x-robots-tag")).toContain("noindex");
 }finally{vi.unstubAllEnvs();}
});

it("includes every published artwork page, legal pages and articles in each public language",async()=>{
 const items=await sitemap(),urls=items.map(i=>i.url);
 for(const prefix of ["","/en"]){for(const path of ["/legal","/artworks/published-one","/artworks/published-two","/news/published-article","/exhibitions/published-article","/publications/published-article"]){expect(urls).toContain("https://canonical.example"+prefix+path);}}
 expect(new Set(urls).size).toBe(urls.length);
 expect(urls.every(url=>!url.includes("preview")&&!url.includes("?"))).toBe(true);
 expect(state.gallery).toHaveBeenCalledWith({locale:"fr",page:2,pageSize:100,catalogRevision:9});
 expect(items.find(i=>i.url.endsWith("/artworks/published-one"))?.alternates?.languages).toHaveProperty("en","https://canonical.example/en/artworks/published-one");
});

it("fails instead of advertising a silently truncated or inconsistent catalogue",async()=>{
 state.gallery.mockRejectedValueOnce(new Error("catalog_changed"));
 await expect(sitemap()).rejects.toThrow("catalog_changed");
});
