const maxBytes=10*1024*1024;
const tag=(bytes:Uint8Array,at:number)=>String.fromCharCode(...bytes.subarray(at,at+4));

/** Inspect the existing RIFF timeline without decoding or recompressing its frames.
 * https://developers.google.com/speed/webp/docs/riff_container#animation */
export function singlePassWebp(bytes:Uint8Array):{bytes:ArrayBuffer;durationMs:number}|null{
 if(bytes.length<12||bytes.length>maxBytes||tag(bytes,0)!=="RIFF"||tag(bytes,8)!=="WEBP")throw new Error("invalid_webp");
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(4,true)+8!==bytes.length)throw new Error("invalid_webp");
 let loopOffset:number|undefined,animated=false;
 const frames:{at:number;duration:number}[]=[];
 for(let at=12;at<bytes.length;){
  if(at+8>bytes.length)throw new Error("invalid_webp");
  const name=tag(bytes,at),size=view.getUint32(at+4,true),data=at+8,end=data+size+(size%2);
  if(end>bytes.length)throw new Error("invalid_webp");
  if(name==="VP8X"){if(size!==10)throw new Error("invalid_webp");animated=Boolean(bytes[data]!&2);}
  if(name==="ANIM"){if(size!==6||loopOffset!==undefined)throw new Error("invalid_webp");loopOffset=data+4;}
  if(name==="ANMF"){
   if(size<16||frames.length>=300)throw new Error("invalid_webp");
   const duration=bytes[data+12]!+bytes[data+13]!*256+bytes[data+14]!*65536;
   // Very short WebP delays are browser-dependent. Make their usual 100ms
   // minimum explicit so the native image and the completion clock agree.
   frames.push({at:data+12,duration:duration<=10?100:duration});
  }
  at=end;
 }
 if(!animated){if(loopOffset!==undefined||frames.length)throw new Error("invalid_webp");return null;}
 if(loopOffset===undefined||!frames.length)throw new Error("invalid_webp");
 const result=new ArrayBuffer(bytes.length),copy=new Uint8Array(result);copy.set(bytes);
 new DataView(result).setUint16(loopOffset,1,true);
 for(const frame of frames){copy[frame.at]=frame.duration&255;copy[frame.at+1]=(frame.duration>>>8)&255;copy[frame.at+2]=(frame.duration>>>16)&255;}
 return {bytes:result,durationMs:frames.reduce((sum,frame)=>sum+frame.duration,0)};
}

/** Keep the browser's allocation bounded even if an upstream length is absent. */
export async function readHeroWebp(response:Response):Promise<Uint8Array>{
 if(!response.ok||Number(response.headers.get("content-length"))>maxBytes){await response.body?.cancel();throw new Error("webp_unavailable");}
 const reader=response.body?.getReader();if(!reader)throw new Error("webp_unavailable");
 const chunks:Uint8Array[]=[];let size=0;
 try{
  for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>maxBytes)throw new Error("webp_too_large");chunks.push(part.value);}
  const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return bytes;
 }finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
