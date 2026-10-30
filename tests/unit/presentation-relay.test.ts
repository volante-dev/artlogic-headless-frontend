import {expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>({}),stringValue:()=>"http://127.0.0.1:43210",numberValue:()=>5000}));
import {relayPublicAsset} from "../../lib/presentation/relay-asset";
const id="11111111-1111-4111-8111-111111111111",url="http://127.0.0.1:3000/presentation-assets/"+id;

it("relays ranges without forwarding cookies, credentials, conditionals or arbitrary headers",async()=>{
  const fetchSpy=vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response(new Uint8Array([1,2,3]),{status:206,headers:{"content-type":"video/mp4","content-length":"3","content-range":"bytes 0-2/100","x-private-header":"secret"}}));
  const response=await relayPublicAsset(new Request(url,{headers:{Range:"bytes=0-2",Cookie:"secret","x-bff-key":"secret","If-None-Match":"*"}}),id);
  expect(response.status).toBe(206);expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));expect(response.headers.get("x-private-header")).toBeNull();expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(fetchSpy.mock.calls[0][1]).toMatchObject({headers:{Accept:"image/webp, video/mp4, font/woff2",Range:"bytes=0-2"},redirect:"error",cache:"no-store"});expect(Object.keys(fetchSpy.mock.calls[0][1]!.headers!)).toEqual(["Accept","Range"]);
});
it("keeps HEAD bodies empty and masks upstream error text",async()=>{
  const fetchSpy=vi.spyOn(globalThis,"fetch").mockResolvedValueOnce(new Response(null,{status:200,headers:{"content-type":"font/woff2","content-length":"1234"}})).mockResolvedValueOnce(new Response("secret-storage-key",{status:404}));
  const head=await relayPublicAsset(new Request(url,{method:"HEAD"}),id);expect(head.status).toBe(200);expect(head.headers.get("content-length")).toBe("1234");expect(await head.text()).toBe("");
  const denied=await relayPublicAsset(new Request(url,{method:"HEAD"}),id);expect(denied.status).toBe(404);expect(await denied.text()).toBe("");expect(fetchSpy).toHaveBeenCalledTimes(2);
});
it("bounds bodies even without Content-Length and propagates cancellation",async()=>{
  let cancelled=false;const fetchSpy=vi.spyOn(globalThis,"fetch").mockResolvedValueOnce(new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array(20971521));controller.close();}}),{headers:{"content-type":"video/mp4"}}));
  const oversize=await relayPublicAsset(new Request(url),id);await expect(oversize.arrayBuffer()).rejects.toThrow("asset_transfer_failed");
  fetchSpy.mockResolvedValueOnce(new Response(new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(16));},cancel(){cancelled=true;}}),{headers:{"content-type":"video/mp4"}}));
  const response=await relayPublicAsset(new Request(url),id);const reader=response.body!.getReader();await reader.read();await reader.cancel();expect(cancelled).toBe(true);
});
it("rejects technical path/query errors before network access and bad upstream ranges",async()=>{
  const fetchSpy=vi.spyOn(globalThis,"fetch");
  expect((await relayPublicAsset(new Request(url),"bad-id")).status).toBe(404);expect((await relayPublicAsset(new Request(url+"?variant=original&variant=w640"),id)).status).toBe(400);expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockResolvedValueOnce(new Response(new Uint8Array(3),{status:206,headers:{"content-type":"video/mp4","content-length":"3","content-range":"bytes 5-7/6"}}));
  expect((await relayPublicAsset(new Request(url,{headers:{range:"bytes=0-2"}}),id)).status).toBe(503);
});
