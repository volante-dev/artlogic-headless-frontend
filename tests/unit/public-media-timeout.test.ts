import {afterEach,beforeEach,expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
vi.mock("@/lib/config/env",()=>({loadConfig:()=>({BACKEND_URL:"https://api.test",REQUEST_TIMEOUT_MS:15000,PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000,PUBLIC_MEDIA_REQUEST_TIMEOUT_MS:45000}),stringValue:(c:Record<string,string>,k:string)=>c[k],numberValue:(c:Record<string,number>,k:string)=>c[k]}));
import {publicFetch} from "@/lib/api/client";
const media="/v1/public/media/3df610c8-e2a3-4101-878c-9169c500f808";
beforeEach(()=>{
 vi.useFakeTimers();
 vi.spyOn(AbortSignal,"timeout").mockImplementation(ms=>{const c=new AbortController();setTimeout(()=>c.abort(new DOMException("Deadline","TimeoutError")),ms);return c.signal;});
});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});
function upstream(delay:number){
 const fetch=vi.fn((_url:string,init:RequestInit)=>new Promise<Response>((resolve,reject)=>{
  const timer=setTimeout(()=>resolve(new Response("image",{headers:{"content-type":"image/webp"}})),delay);
  init.signal?.addEventListener("abort",()=>{clearTimeout(timer);reject(init.signal?.reason);},{once:true});
 }));vi.stubGlobal("fetch",fetch);return fetch;
}
it("waits for a 23-second cold media read while preserving private streaming and redirect guards",async()=>{
 const fetch=upstream(23000),read=publicFetch(media);await vi.advanceTimersByTimeAsync(23000);const r=await read;
 expect(r.status).toBe(200);expect(await r.text()).toBe("image");expect(fetch).toHaveBeenCalledTimes(1);
 expect(fetch.mock.calls[0]?.[1]).toMatchObject({cache:"no-store",redirect:"error"});
 expect(AbortSignal.timeout).toHaveBeenCalledWith(45000);
});
it("lets page JSON survive a cold start within the configurable public deadline",async()=>{
 upstream(23000);const read=publicFetch("/v1/public/artworks");await vi.advanceTimersByTimeAsync(23000);expect((await read).status).toBe(200);expect(AbortSignal.timeout).toHaveBeenCalledWith(45000);
});
it("bounds slow media reads and honors an earlier caller cancellation without retrying",async()=>{
 const fetch=upstream(60000),read=expect(publicFetch(media)).rejects.toMatchObject({status:503});await vi.advanceTimersByTimeAsync(45000);await read;
 const c=new AbortController(),cancelled=expect(publicFetch(media,c.signal)).rejects.toMatchObject({status:503});c.abort();await cancelled;
 expect(fetch).toHaveBeenCalledTimes(2);
});
