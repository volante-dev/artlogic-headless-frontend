import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
export class PublicApiError extends Error {constructor(readonly status:number,readonly code:string,readonly retryAfterSeconds?:number){super(code);}}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
export async function publicFetch(path:string,signal?:AbortSignal):Promise<Response>{
  if(!/^\/v1\/public\/(?:artworks(?:\/[0-9a-f-]{36})?|artwork-catalog|artwork-experiences\/[a-z0-9-]{1,113}|(?:media|site-logos)\/[0-9a-f-]{36}|site-content)(?:\?[^#]*|$)$/i.test(path))throw new PublicApiError(400,"invalid_request");
  const config=loadConfig();try{return await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{headers:{Accept:"application/json, image/webp"},cache:"no-store",redirect:"error",signal:signal?AbortSignal.any([signal,AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))]):AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))});}
  catch{throw new PublicApiError(503,"service_unavailable");}
}
export async function publicJson(path:string):Promise<unknown>{
  const response=await publicFetch(path);
  if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,409,429].includes(response.status)?response.status:503,response.status===409?"catalog_changed":response.status===404?"not_found":"service_unavailable");}
  const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
  try{let size=0;const chunks:Uint8Array[]=[];for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>10485760)throw new Error();chunks.push(chunk.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
  catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);}
}
