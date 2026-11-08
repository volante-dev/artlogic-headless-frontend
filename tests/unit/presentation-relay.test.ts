import {expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>({DATA_MODE:"mock"}),stringValue:()=>"http://127.0.0.1:43210",numberValue:()=>5000}));
import {relayPublicAsset} from "../../lib/presentation/relay-asset";
const id="11111111-1111-4111-8111-111111111111",url="http://127.0.0.1:3000/presentation-assets/"+id,signed="http://127.0.0.1:55321/storage/v1/object/sign/private/video.mp4?token=synthetic";
const grant=(changes:Record<string,unknown>={})=>Response.json({url:signed,expiresAt:new Date(Date.now()+60000).toISOString(),...changes});
it("redirects to a short-lived authorization without proxying bytes or forwarding visitor credentials and ranges",async()=>{
 const spy=vi.spyOn(globalThis,"fetch").mockResolvedValue(grant());const response=await relayPublicAsset(new Request(url,{headers:{Range:"bytes=0-2",Cookie:"private","X-BFF-Key":"private","If-None-Match":"*"}}),id);
 expect(response.status).toBe(307);expect(response.headers.get("location")).toBe(signed);expect(await response.text()).toBe("");expect(response.headers.get("cache-control")).toBe("private, no-store");expect(response.headers.get("referrer-policy")).toBe("no-referrer");
 expect(spy).toHaveBeenCalledTimes(1);expect(spy.mock.calls[0][0]).toBe("http://127.0.0.1:43210/v1/public/presentation-assets/"+id+"/authorization");expect(spy.mock.calls[0][1]).toMatchObject({method:"GET",headers:{Accept:"application/json"},redirect:"error",cache:"no-store"});
});
it("keeps HEAD bodies empty and masks upstream error bodies",async()=>{
 vi.spyOn(globalThis,"fetch").mockResolvedValueOnce(grant()).mockResolvedValueOnce(new Response("secret-storage-key",{status:404}));const head=await relayPublicAsset(new Request(url,{method:"HEAD"}),id);expect(head.status).toBe(307);expect(await head.text()).toBe("");const denied=await relayPublicAsset(new Request(url,{method:"HEAD"}),id);expect(denied.status).toBe(404);expect(await denied.text()).toBe("");expect(denied.headers.get("location")).toBeNull();
});
it("refuses expired, overlong and malformed authorizations without exposing their target",async()=>{
 const spy=vi.spyOn(globalThis,"fetch");for(const response of [grant({expiresAt:new Date(Date.now()-1000).toISOString()}),grant({expiresAt:new Date(Date.now()+120000).toISOString()}),grant({url:"https://example.test/not-signed"}),new Response("x".repeat(16385),{headers:{"content-type":"application/json"}}),new Response("private",{headers:{"content-type":"video/mp4"}})]){spy.mockResolvedValueOnce(response);const denied=await relayPublicAsset(new Request(url),id);expect(denied.status).toBe(503);expect(denied.headers.get("location")).toBeNull();expect(await denied.text()).not.toContain("private");}
});
it("rejects path/query errors before authorization and carries only the validated image variant",async()=>{
 const spy=vi.spyOn(globalThis,"fetch");expect((await relayPublicAsset(new Request(url),"bad-id")).status).toBe(404);expect((await relayPublicAsset(new Request(url+"?variant=original&variant=w640"),id)).status).toBe(400);expect(spy).not.toHaveBeenCalled();spy.mockResolvedValueOnce(grant());expect((await relayPublicAsset(new Request(url+"?variant=w640"),id)).status).toBe(307);expect(spy.mock.calls[0][0]).toContain("/authorization?variant=w640");
});
