import {languageBusinessHeaders} from '../i18n/request-language';
import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
export class PublicApiError extends Error {constructor(readonly status:number,readonly code:string,readonly retryAfterSeconds?:number,readonly details:readonly {field:string;reason:string}[]=[]){super(code);}}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
export async function publicFetch(path:string,signal?:AbortSignal,options?:{method?:"GET"|"HEAD";displayId?:string;cardFocus?:boolean;saleAvailability?:boolean;artworkAddresses?:boolean;languageHeaders?:Record<string,string>}):Promise<Response>{
  const editorial=/^\/v1\/public\/editorial\/(?:articles(?:\/(?:publication|news|exhibition)\/[^/?#]+)?|article-addresses\/[a-f0-9-]{36}|media\/[a-f0-9-]{36}\/authorization|filters)(?:\?[^#]*)?$/i;
  const commerce=/^\/v1\/public\/store(?:\/products(?:\/[a-f0-9-]{36})?|\/documents\/(?:legal|terms|privacy|withdrawal)|\/consent-policy|\/checkout-options)?(?:\?[^#]*)?$/i;
  const linkInBio=/^\/v1\/public\/link-in-bio(?:\/capabilities)?(?:\?[^#]*)?$/;
  if(!/^\/v1\/public\/artwork-addresses\/(?:capabilities|lookup|resolve)(?:\?[^#]*)?$/.test(path)&&!/^\/v1\/public\/languages\/(?:content|redirects\/resolve)\?[^#]+$/.test(path)&&!linkInBio.test(path)&&!commerce.test(path)&&!editorial.test(path)&&!/^\/v1\/public\/(?:artworks(?:\/[0-9a-f-]{36})?|artwork-catalog|artwork-experiences\/[a-z0-9-]{1,113}|(?:media|site-logos)\/[0-9a-f-]{36}(?:\/authorization)?|site-content)(?:\?[^#]*|$)$/i.test(path))throw new PublicApiError(400,"invalid_request");
  const config=loadConfig();
  // Private media still passes through authorization on every read. Its bounded
  // deadline also covers API cold starts, which can exceed ordinary JSON reads.
  const timeout=AbortSignal.timeout(numberValue(config,/^\/v1\/public\/media\/[0-9a-f-]{36}$/i.test(path)?"PUBLIC_MEDIA_REQUEST_TIMEOUT_MS":"PUBLIC_PAGE_REQUEST_TIMEOUT_MS"));
  const readId=crypto.randomUUID(),started=performance.now(),category=path.split('?')[0]!.split('/')[3]!,media=['media','site-logos'].includes(category);
  const record=(status:number,result:'headers'|'timeout'|'aborted'|'network_error',response?:Response)=>{const durationMs=Math.round(performance.now()-started);if(media&&status<500&&durationMs<1000)return;const diagnostic=(name:string)=>{const value=response?.headers.get(name);return typeof value==='string'&&/^[a-zA-Z0-9_:.-]{1,160}$/.test(value)?value:undefined;};console.info(JSON.stringify({event:'public_api_fetch',readId,category,method:options?.method??'GET',status,result,durationMs,apiRequestId:diagnostic('x-request-id'),apiEdgeId:diagnostic('x-vercel-id'),apiInstanceId:diagnostic('x-api-instance-id'),apiInitializationId:diagnostic('x-api-initialization-id'),apiDataCache:diagnostic('x-public-read-cache')}));};
  // Explicit server-owned headers let cache keys include the admitted revision without reading a request inside use cache.
  const languageHeaders=media||category==='languages'?{}:options?.languageHeaders??await languageBusinessHeaders().catch(()=>{throw new PublicApiError(503,'language_policy_unavailable');});
  try{const response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{method:options?.method??"GET",headers:{...languageHeaders,...(options?.artworkAddresses?{"X-Artwork-Address-Contract":"1"}:{}),"X-API-Read-Id":readId,Accept:"application/json, image/webp",...(options?.cardFocus?{"X-Artwork-Card-Focus":"1"}:{}),...(options?.saleAvailability?{"X-Artwork-Sale-Availability":"1"}:{}),...(options?.displayId?{"X-Media-Display-Id":options.displayId}:{})},cache:"no-store",redirect:"error",signal:signal?AbortSignal.any([signal,timeout]):timeout});record(response.status,'headers',response);return response;}
  catch{record(503,timeout.aborted?'timeout':signal?.aborted?'aborted':'network_error');throw new PublicApiError(503,"service_unavailable");}
}
export async function publicJson(path:string,options?:{cardFocus?:boolean;artworkAddresses?:boolean;signal?:AbortSignal}):Promise<unknown>{
  const response=await publicFetch(path,options?.signal,options);
  if(!response.ok){
    if(response.status===409&&await responseLanguagePolicyChanged(response))throw new PublicApiError(409,'language_policy_changed');
    if(path.startsWith('/v1/public/languages/content?')){
      let error:unknown;try{error=await boundedPublicJson(response,65536);}catch{/* An unrecognized error never permits catalogue fallback. */}
      const payload=error&&typeof error==='object'?(error as {error?:{code?:unknown;details?:unknown}}).error:undefined;
      if(response.status===503&&payload?.code==='capability_unavailable'&&Array.isArray(payload.details)&&payload.details.length===1&&payload.details[0]?.field==='catalogue'&&payload.details[0]?.reason==='unsupported_catalogue')throw new PublicApiError(503,'capability_unavailable',undefined,[{field:'catalogue',reason:'unsupported_catalogue'}]);
    }
    await response.body?.cancel().catch(()=>undefined);throw new PublicApiError([400,404,409,429].includes(response.status)?response.status:503,response.status===409?"catalog_changed":response.status===404?"not_found":"service_unavailable");
  }
  return boundedPublicJson(response,path.startsWith('/v1/public/languages/content?')?4194304:10485760);
}
/** Error bodies are bounded independently of the successful business payload. */
export async function responseLanguagePolicyChanged(response:Response):Promise<boolean>{
 if(response.status!==409)return false;
 try{const value=await boundedPublicJson(response,65536);return Boolean(value&&typeof value==='object'&&'error'in value&&value.error&&typeof value.error==='object'&&'code'in value.error&&value.error.code==='language_policy_changed');}catch{return false;}
}
async function boundedPublicJson(response:Response,limit:number):Promise<unknown>{
  const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
  try{let size=0;const chunks:Uint8Array[]=[];for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>limit)throw new Error();chunks.push(chunk.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
  catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);}
}
