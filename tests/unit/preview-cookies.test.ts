import {expect,it,vi} from "vitest";
import {NextResponse} from "next/server";
const env=vi.hoisted(()=>({SITE_ORIGIN:"https://gallery.example",SITE_ID:"11111111-1111-4111-8111-111111111111",DATA_MODE:"real",DEPLOYMENT_ENV:"production"}));
vi.mock("server-only",()=>({}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>env,stringValue:(c:Record<string,string>,key:string)=>c[key],isLoopback:(host:string)=>["localhost","127.0.0.1","[::1]"].includes(host)}));
import {clearPreviewCookies,previewCookieSettings,putPreviewCookies} from "../../lib/presentation/preview-cookies";
it("sets two site-scoped host-only cookies with only CSRF visible to JavaScript, and clears both",()=>{
 env.SITE_ORIGIN="https://gallery.example";env.DATA_MODE="real";env.DEPLOYMENT_ENV="production";
 const response=new NextResponse(),settings=previewCookieSettings();putPreviewCookies(response,"s".repeat(43),"c".repeat(43),"2030-01-01T00:00:00.000Z");
 expect(response.cookies.getAll()).toHaveLength(2);for(const cookie of response.cookies.getAll()){expect(cookie).toMatchObject({secure:true,sameSite:"lax",path:"/"});expect(cookie.domain).toBeUndefined();expect(cookie.name).toContain(env.SITE_ID);expect(cookie.name).toMatch(/^__Host-/);}
 expect(response.cookies.get(settings.names.session)?.httpOnly).toBe(true);expect(response.cookies.get(settings.names.csrf)?.httpOnly).toBe(false);
 clearPreviewCookies(response);for(const cookie of response.cookies.getAll())expect(cookie).toMatchObject({value:"",maxAge:0});
});
it("permits insecure cookies only for local mock loopback",()=>{
 env.SITE_ORIGIN="http://127.0.0.1:3000";env.DATA_MODE="mock";env.DEPLOYMENT_ENV="test";expect(previewCookieSettings().secure).toBe(false);expect(previewCookieSettings().names.session).not.toMatch(/^__Host-/);
 for(const change of [{DATA_MODE:"real"},{DEPLOYMENT_ENV:"production"},{SITE_ORIGIN:"http://gallery.example"}]){Object.assign(env,{SITE_ORIGIN:"http://127.0.0.1:3000",DATA_MODE:"mock",DEPLOYMENT_ENV:"test"},change);expect(()=>previewCookieSettings()).toThrow("secure_preview_cookies_required");}
});
