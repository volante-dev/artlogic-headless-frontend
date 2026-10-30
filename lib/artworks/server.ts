import "server-only";
import {publicFetch,PublicApiError} from "../api/client";
import {parseGalleryCatalog,parseGalleryExperience} from "./validate";
import type {GallerySearch} from "./types";
/** Only the fixed public API origin is contacted; no cookies/service credentials. */
async function json(path:string,signal?:AbortSignal){
 const response=await publicFetch(path,signal),reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
 let value:unknown;try{const chunks:Uint8Array[]=[],max=response.ok?10485760:65536;let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error();chunks.push(value);}value=JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);}
 if(!response.ok){const status=[400,404,409,429].includes(response.status)?response.status:503,raw=value as {error?:{code?:unknown}};const code=raw?.error?.code;const allowed=status===400?["invalid_request","page_out_of_range"]:status===404?["not_found"]:status===409?["catalog_changed"]:status===429?["rate_limited"]:["service_unavailable"];throw new PublicApiError(status,typeof code==="string"&&allowed.includes(code)?code:status===503?"service_unavailable":"invalid_response",status===429&&/^[1-9][0-9]{0,3}$/.test(response.headers.get("retry-after")??"")?Number(response.headers.get("retry-after")):undefined);}
 return value;
}
export async function getGalleryCatalog(input:GallerySearch={}){
 const query=new URLSearchParams();for(const [key,value]of Object.entries(input))if(value!==undefined)query.set(key,String(value));
 const result=await json("/v1/public/artwork-catalog"+(query.size?"?"+query.toString():""));try{return parseGalleryCatalog(result);}catch{throw new PublicApiError(503,"invalid_response");}
}
export async function getGalleryExperience(reference:string,locale:string,signal?:AbortSignal){
 if(!/^[a-z0-9-]{1,113}$/i.test(reference)||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale))throw new PublicApiError(404,"not_found");
 const result=await json("/v1/public/artwork-experiences/"+encodeURIComponent(reference)+"?locale="+encodeURIComponent(locale),signal);try{const d=parseGalleryExperience(result);if(d.locale!==locale)throw new Error();return d;}catch{throw new PublicApiError(503,"invalid_response");}
}
