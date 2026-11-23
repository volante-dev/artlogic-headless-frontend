import {it,expect,vi,afterEach} from "vitest";
vi.mock("server-only",()=>({}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>({BACKEND_URL:"https://api.example.test",PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000,PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS:1500,PUBLIC_MEDIA_DIRECT_ENABLED:"true",PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON:["https://storage.example.test"]}),numberValue:(c:Record<string,number>,k:string)=>c[k],stringValue:(c:Record<string,string>,k:string)=>c[k],listValue:(c:Record<string,string[]>,k:string)=>c[k]}));
import {validateImageGrant} from "../../lib/media/public-image-authorization";
import {relayResponsiveImage} from "../../lib/media/public-image-http";
import {relayPublicMedia} from "../../lib/media/relay-public-media";
const id="33000000-0000-4000-8000-000000000011",resource={resourceKind:"artwork" as const,resourceId:id},version=id+".ref";
const authorization=()=>({...resource,sourceVersion:version,policyVersion:"r1",requestedRendition:"r1-w320",canonicalRendition:"r1-w320",source:{width:1920,height:1280,mimeType:"image/webp",byteSize:10000},representation:{mode:"transformed",expectedWidth:320,expectedHeight:213,mimeType:null,byteSize:null},delivery:{transport:"inventory_relay",resourceId:id,sourceVersion:version,rendition:"r1-w320",expiresAt:new Date(Date.now()+30000).toISOString()}});
afterEach(()=>vi.unstubAllGlobals());
it("accepts a closed inventory reference and refuses arbitrary destinations or mismatched versions",()=>{
 const grant=authorization();expect(validateImageGrant(grant,resource,version,"r1-w320",["https://storage.example.test"])).toEqual(grant);
 for(const delivery of [{...grant.delivery,url:"https://untrusted.example/photo"},{...grant.delivery,sourceVersion:"old"},{...grant.delivery,resourceId:"other"},{...grant.delivery,rendition:"original"}])expect(()=>validateImageGrant({...grant,delivery},resource,version,"r1-w320",["https://storage.example.test"])).toThrow();
});
it("streams inventory from the known backend and preserves no-store even with direct delivery enabled",async()=>{
 const requests:string[]=[],fetch=vi.fn(async(input:unknown)=>{const url=String(input);requests.push(url);if(url.includes("image-authorization"))return Response.json(authorization());return new Response(new Uint8Array([82,73,70,70]),{headers:{"Content-Type":"image/webp","Content-Length":"4","Cache-Control":"private, no-store"}});});vi.stubGlobal("fetch",fetch);
 const response=await relayResponsiveImage(new Request("https://site.example.test/media/"+id+"?image=r1-w320&v="+version),id,"artwork");expect(response.status).toBe(200);expect(response.headers.get("location")).toBeNull();expect(response.headers.get("cache-control")).toContain("no-store");expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([82,73,70,70]));expect(requests).toHaveLength(2);expect(requests.every(url=>url.startsWith("https://api.example.test/"))).toBe(true);expect(requests[1]).not.toContain("storage/v1");
});
it.each(["GET","HEAD"])("returns a revoked %s representation as 404 without any redirect or retry to Storage",async method=>{
 const fetch=vi.fn(async()=>new Response(null,{status:404}));vi.stubGlobal("fetch",fetch);const response=await relayResponsiveImage(new Request("https://site.example.test/media/"+id+"?image=r1-w320&v="+version,{method}),id,"artwork",method==="HEAD");expect(response.status).toBe(404);expect(response.headers.get("location")).toBeNull();expect(response.headers.get("cache-control")).toContain("no-store");expect(fetch).toHaveBeenCalledTimes(1);
});
it("streams the native reference from the legacy URL when direct delivery is enabled",async()=>{
 const calls:string[]=[],fetch=vi.fn(async(input:unknown)=>{const url=String(input);calls.push(url);if(url.endsWith("/authorization"))return Response.json({transport:"inventory_relay",resourceId:id,version:id,expiresAt:new Date(Date.now()+30000).toISOString(),mimeType:"image/webp",byteSize:4});return new Response(new Uint8Array([82,73,70,70]),{headers:{"Content-Type":"image/webp","Content-Length":"4"}});});vi.stubGlobal("fetch",fetch);
 const response=await relayPublicMedia(new Request("https://site.example.test/media/"+id),id,"artwork");expect(response.status).toBe(200);expect(response.headers.get("location")).toBeNull();expect(response.headers.get("cache-control")).toContain("no-store");await response.arrayBuffer();expect(calls).toHaveLength(2);expect(calls.every(url=>url.startsWith("https://api.example.test/"))).toBe(true);
});
it("refuses a redirect response from the native byte endpoint",async()=>{
 const fetch=vi.fn(async(input:unknown)=>String(input).includes("image-authorization")?Response.json(authorization()):new Response(null,{status:307,headers:{Location:"https://untrusted.example/private"}}));vi.stubGlobal("fetch",fetch);
 const response=await relayResponsiveImage(new Request("https://site.example.test/media/"+id+"?image=r1-w320&v="+version),id,"artwork");expect(response.status).toBe(503);expect(response.headers.get("location")).toBeNull();expect(fetch).toHaveBeenCalledTimes(2);
});
