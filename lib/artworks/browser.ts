import {parseAddressedExperience} from "./addresses";
import type {GalleryExperience} from "./types";
export class ArtworkReadError extends Error {constructor(readonly status:number){super("artwork_unavailable");}}
export async function readArtworkExperience(reference:string,locale:string,signal:AbortSignal):Promise<GalleryExperience>{
  if(!/^[a-z0-9-]{1,113}$/i.test(reference))throw new ArtworkReadError(404);
  const response=await fetch("/api/artwork-experiences/"+encodeURIComponent(reference)+"?locale="+encodeURIComponent(locale),{cache:"no-store",credentials:"omit",headers:{"X-Artwork-Address-Contract":"1"},redirect:"error",signal});
  if(!response.ok){await response.body?.cancel();throw new ArtworkReadError([404,429].includes(response.status)?response.status:503);}
  const reader=response.body?.getReader();if(!reader)throw new ArtworkReadError(503);
  try{
    const decoder=new TextDecoder(),chunks:string[]=[];let size=0;
    for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>10485760)throw new ArtworkReadError(503);chunks.push(decoder.decode(part.value,{stream:true}));}
    chunks.push(decoder.decode());const contract=response.headers.get("x-artwork-address-contract");if(contract!=="1"&&contract!=="0")throw new ArtworkReadError(503);const result=parseAddressedExperience(JSON.parse(chunks.join("")),contract==="1");
    if(result.locale!==locale)throw new ArtworkReadError(503);return result;
  }catch(error){if(signal.aborted)throw error;throw new ArtworkReadError(503);}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
