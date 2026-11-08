import {describe,it,expect,vi} from "vitest";
vi.mock("server-only",()=>({}));
import {acceptsPublicOrigin} from "../../lib/contact/public-origin";
import type {Config} from "../../lib/config/env";
const primary="https://gallery.example.test",preview="https://preview.gallery.example.test",alias="https://gallery.vercel.app";
const config:Config={role:"F",SITE_ORIGIN:primary,SITE_ALLOWED_ORIGINS_JSON:[preview,alias]};
const request=(origin:string|null,method="POST",site="same-origin")=>new Request(primary+"/api/forms/example/sessions",{method,headers:{...(origin===null?{}:{origin}),"sec-fetch-site":site}});
describe("public website origin policy",()=>{
 it.each([primary,preview,alias])("accepts an explicitly trusted origin: %s",origin=>expect(acceptsPublicOrigin(request(origin),config)).toBe(true));
 it("preserves the preview when the primary origin changes",()=>{
  const migrated:Config={...config,SITE_ORIGIN:"https://new-gallery.example.test",SITE_ALLOWED_ORIGINS_JSON:[preview,alias]};
  for(const origin of ["https://new-gallery.example.test",preview,alias])expect(acceptsPublicOrigin(request(origin),migrated)).toBe(true);
  expect(acceptsPublicOrigin(request(primary),migrated)).toBe(false);
 });
 it("keeps the primary origin accepted with an empty alias list",()=>expect(acceptsPublicOrigin(request(primary),{...config,SITE_ALLOWED_ORIGINS_JSON:[]})).toBe(true));
 it.each([null,"null","https://evil.example.test","https://gallery.example.test.evil.test","https://other.gallery.example.test","https://gallery.example.test:8443","http://gallery.example.test",primary+"/"])("rejects an absent, malformed or unlisted origin: %s",origin=>expect(acceptsPublicOrigin(request(origin),config)).toBe(false));
 it.each(["POST","DELETE"])("does not infer origin trust from request or forwarded hosts for %s",method=>{
  const forged=new Request(alias+"/api/forms/example",{method,headers:{origin:"https://evil.test",host:"gallery.example.test","x-forwarded-host":"gallery.example.test"}});
  expect(acceptsPublicOrigin(forged,config)).toBe(false);
 });
 it.each(["GET","POST","DELETE"])("rejects cross-site requests even with a claimed trusted origin for %s",method=>expect(acceptsPublicOrigin(request(preview,method,"cross-site"),config)).toBe(false));
 it("keeps ordinary same-origin GET reads independent of an Origin header",()=>expect(acceptsPublicOrigin(request(null,"GET"),config)).toBe(true));
});
