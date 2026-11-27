import "server-only";
import {cache} from 'react';
import {loadConfig} from '../config/env';
import {parseArtworkAddressCapability,parseArtworkAddressResolution,parseAddressedCatalog,parseAddressedExperience} from './addresses';
export const addressCapability=cache(async()=>{
 const floor=String(loadConfig().ARTWORK_ADDRESSES_MINIMUM_CONTRACT_VERSION??'0')==='1';
 const response=await publicFetch('/v1/public/artwork-addresses/capabilities');
 if(response.status===404&&!floor){await response.body?.cancel();return false;}
 if(!response.ok){await response.body?.cancel();throw new PublicApiError(503,'service_unavailable');}
 let value:unknown;const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,'invalid_response');try{const chunks:Uint8Array[]=[];let size=0;for(;;){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>4096)throw new Error();chunks.push(p.value);}value=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new PublicApiError(503,'invalid_response');}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
 try{const c=parseArtworkAddressCapability(value);if(floor&&!c.available)throw new Error();return c.available;}catch{throw new PublicApiError(503,'invalid_response');}
});
export async function resolveArtworkAddress(reference:string,locale:string,signal?:AbortSignal,path=false){
 if(!await addressCapability())return null;
 const q=new URLSearchParams({locale,[path?'path':'reference']:reference});
 const result=await json('/v1/public/artwork-addresses/resolve?'+q,signal);
 try{return parseArtworkAddressResolution(result);}catch{throw new PublicApiError(503,'invalid_response');}
}
import {artworkApiReference} from "./artwork-api-reference";
import {publicFetch,PublicApiError} from "../api/client";
import {parseGalleryCatalog,parseGalleryExperience} from "./validate";
import type {GallerySearch} from "./types";
/** Only the fixed public API origin is contacted; no cookies/service credentials. */
async function json(path:string,signal?:AbortSignal,cardFocus=false,saleAvailability=false,addresses=false,attempt=0){
 const response=await publicFetch(path,signal,{cardFocus,artworkAddresses:addresses,...(saleAvailability?{saleAvailability:true}:{})}),reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
 let value:unknown;try{const chunks:Uint8Array[]=[],max=response.ok?10485760:65536;let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error();chunks.push(value);}value=JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);}
 if(!response.ok){const status=[400,404,409,429].includes(response.status)?response.status:503,raw=value as {error?:{code?:unknown}};const code=raw?.error?.code;if(status===409&&code==="address_context_changed"&&attempt===0)return json(path,signal,cardFocus,saleAvailability,addresses,1);const allowed=status===400?["invalid_request","page_out_of_range"]:status===404?["not_found"]:status===409?["catalog_changed","language_policy_changed","address_context_changed"]:status===429?["rate_limited"]:["service_unavailable","type_filters_unavailable"];throw new PublicApiError(status,typeof code==="string"&&allowed.includes(code)?code:status===503?"service_unavailable":"invalid_response",status===429&&/^[1-9][0-9]{0,3}$/.test(response.headers.get("retry-after")??"")?Number(response.headers.get("retry-after")):undefined);}
 return value;
}
export async function getGalleryCatalog(input:GallerySearch={},plp=false,signal?:AbortSignal,cardFocus=true,addresses=true){
 const query=new URLSearchParams({includeTypes:"1"});for(const [key,value]of Object.entries(input))if(value!==undefined)query.set(key,String(value));
 if(plp)query.set("display","plp");
 const negotiated=addresses&&await addressCapability();
 const result=await json("/v1/public/artwork-catalog"+(query.size?"?"+query.toString():""),signal,plp&&cardFocus,false,negotiated);try{return addresses?parseAddressedCatalog(result,plp,negotiated):parseGalleryCatalog(result,plp);}catch{throw new PublicApiError(503,"invalid_response");}
}
export async function getGalleryExperience(reference:string,locale:string,signal?:AbortSignal,addresses=true){
 if(!/^[a-z0-9-]{1,113}$/i.test(reference)||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale))throw new PublicApiError(404,"not_found");
 const resolution=addresses?await resolveArtworkAddress(reference,locale,signal):null;
 const negotiated=addresses&&await addressCapability();
 const result=await json("/v1/public/artwork-experiences/"+encodeURIComponent(artworkApiReference(resolution?.address.artworkId??reference))+"?locale="+encodeURIComponent(locale),signal,false,true,negotiated);try{const d=addresses?parseAddressedExperience(result,negotiated):parseGalleryExperience(result);if(d.locale!==locale)throw new Error();return d;}catch{throw new PublicApiError(503,"invalid_response");}
}
