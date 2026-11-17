import {readFile} from "node:fs/promises";
import {expect,it} from "vitest";
import {readHeroWebp,singlePassWebp} from "../../lib/media/single-pass-webp";
// Committed synthetic raster fixtures keep frontend checks independent of the API checkout.
const original=new Uint8Array(await readFile(new URL("../fixtures/hero-loop.webp",import.meta.url)));
function chunks(bytes:Uint8Array){const result:{tag:string;data:number;size:number}[]=[],view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);for(let at=12;at<bytes.length;){const size=view.getUint32(at+4,true);result.push({tag:String.fromCharCode(...bytes.subarray(at,at+4)),data:at+8,size});at+=8+size+(size%2);}return result;}
it("plays a previously uploaded infinite WebP once, preserving its frames and actual duration",()=>{
 const saved=original.slice(),result=singlePassWebp(original)!;expect(result.durationMs).toBe(1000);
 const copy=new Uint8Array(result.bytes),anim=chunks(copy).find(c=>c.tag==="ANIM")!;
 expect(new DataView(result.bytes).getUint16(anim.data+4,true)).toBe(1);
 for(let at=0;at<copy.length;at++)if(at!==anim.data+4&&at!==anim.data+5)expect(copy[at]).toBe(original[at]);
 expect(original).toEqual(saved);
});
it("makes very short delays explicit so browser playback and disappearance have the same duration",()=>{
 const bytes=original.slice(),frames=chunks(bytes).filter(c=>c.tag==="ANMF");for(const frame of frames)bytes.fill(0,frame.data+12,frame.data+15);
 const result=singlePassWebp(bytes)!;expect(result.durationMs).toBe(200);const output=new Uint8Array(result.bytes);for(const frame of frames)expect([...output.subarray(frame.data+12,frame.data+15)]).toEqual([100,0,0]);
});
it("keeps existing static WebP images permanent",async()=>{const bytes=new Uint8Array(await readFile(new URL("../fixtures/hero-still.webp",import.meta.url)));expect(singlePassWebp(bytes)).toBeNull();});
it("rejects truncated, oversized or structurally invalid data instead of displaying a looping fallback",()=>{
 for(const input of [original.subarray(0,20),new Uint8Array(10*1024*1024+1),new Uint8Array(20)])expect(()=>singlePassWebp(input)).toThrow("invalid_webp");
 const corrupt=original.slice();new DataView(corrupt.buffer).setUint32(16,0xffffffff,true);expect(()=>singlePassWebp(corrupt)).toThrow("invalid_webp");
});
it("reads a streamed image within its limit and refuses unsuccessful responses",async()=>{
 expect(await readHeroWebp(new Response(original))).toEqual(original);
 await expect(readHeroWebp(new Response(null,{status:403}))).rejects.toThrow("webp_unavailable");
 await expect(readHeroWebp(new Response(original,{headers:{"content-length":String(10*1024*1024+1)}}))).rejects.toThrow("webp_unavailable");
 let canceled=false;const stream=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new Uint8Array(10*1024*1024+1));},cancel(){canceled=true;}});
 await expect(readHeroWebp(new Response(stream))).rejects.toThrow("webp_too_large");expect(canceled).toBe(true);
});
