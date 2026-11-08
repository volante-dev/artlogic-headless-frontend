import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
export class PublicApiError extends Error {constructor(readonly status:number,readonly code:string,readonly retryAfterSeconds?:number){super(code);}}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
export async function publicFetch(path:string,signal?:AbortSignal,options?:{method?:"GET"|"HEAD";displayId?:string}):Promise<Response>{
  const editorial=/^\/v1\/public\/editorial\/(?:articles(?:\/(?:publication|news|exhibition)\/[^/?#]+)?|article-addresses\/[a-f0-9-]{36}|media\/[a-f0-9-]{36}\/authorization|filters)(?:\?[^#]*)?$/i;
  if(!editorial.test(path)&&!/^\/v1\/public\/(?:artworks(?:\/[0-9a-f-]{36})?|artwork-catalog|artwork-experiences\/[a-z0-9-]{1,113}|(?:media|site-logos)\/[0-9a-f-]{36}(?:\/authorization)?|site-content)(?:\?[^#]*|$)$/i.test(path))throw new PublicApiError(400,"invalid_request");
  const config=loadConfig();
  // Private media still passes through authorization on every read. Its bounded
  // deadline also covers API cold starts, which can exceed ordinary JSON reads.
  const timeout=AbortSignal.timeout(numberValue(config,/^\/v1\/public\/media\/[0-9a-f-]{36}$/i.test(path)?"PUBLIC_MEDIA_REQUEST_TIMEOUT_MS":"PUBLIC_PAGE_REQUEST_TIMEOUT_MS"));
  const readId=crypto.randomUUID(),started=performance.now(),category=path.split('?')[0]!.split('/')[3]!,media=['media','site-logos'].includes(category);
  const record=(status:number,result:'headers'|'timeout'|'aborted'|'network_error',response?:Response)=>{const durationMs=Math.round(performance.now()-started);if(media&&status<500&&durationMs<1000)return;const diagnostic=(name:string)=>{const value=response?.headers.get(name);return typeof value==='string'&&/^[a-zA-Z0-9_:.-]{1,160}$/.test(value)?value:undefined;};console.info(JSON.stringify({event:'public_api_fetch',readId,category,method:options?.method??'GET',status,result,durationMs,apiRequestId:diagnostic('x-request-id'),apiEdgeId:diagnostic('x-vercel-id'),apiInstanceId:diagnostic('x-api-instance-id'),apiInitializationId:diagnostic('x-api-initialization-id')}));};
  try{const response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{method:options?.method??"GET",headers:{"X-API-Read-Id":readId,Accept:"application/json, image/webp",...(options?.displayId?{"X-Media-Display-Id":options.displayId}:{})},cache:"no-store",redirect:"error",signal:signal?AbortSignal.any([signal,timeout]):timeout});record(response.status,'headers',response);return response;}
  catch{record(503,timeout.aborted?'timeout':signal?.aborted?'aborted':'network_error');throw new PublicApiError(503,"service_unavailable");}
}
export async function publicJson(path:string):Promise<unknown>{
  const response=await publicFetch(path);
  if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,409,429].includes(response.status)?response.status:503,response.status===409?"catalog_changed":response.status===404?"not_found":"service_unavailable");}
  const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
  try{let size=0;const chunks:Uint8Array[]=[];for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>10485760)throw new Error();chunks.push(chunk.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
  catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);}
}
