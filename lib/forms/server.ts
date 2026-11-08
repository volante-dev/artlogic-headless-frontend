import "server-only";
import {randomUUID} from "node:crypto";
import {validFormContract as valid} from "./contracts";
import {publicFormOperation} from "./operations";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {privateHeaders} from "../api/client";
import {visitorIp} from "../contact/network-context";
import {acceptsPublicOrigin} from "../contact/public-origin";
function failure(status:number,code:string){return Response.json({error:{code,message:"Impossible de confirmer la demande. Votre saisie est conservée.",requestId:randomUUID()}},{status,headers:privateHeaders});}
async function read(stream:ReadableStream<Uint8Array>|null,limit:number){if(!stream)throw new Error("empty");const reader=stream.getReader(),chunks:Uint8Array[]=[];let size=0;try{for(;;){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>limit)throw new Error("limit");chunks.push(item.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;}finally{await reader.cancel().catch(()=>{});}}
export async function relayForms(request:Request,segments:readonly string[]){
 const operation=publicFormOperation(request.method,segments);if(!operation)return failure(404,"not_found");
 const config=loadConfig();if(config.FORMS_ENABLED!=="true")return failure(503,"forms_disabled");
 const origin=stringValue(config,"SITE_ORIGIN");if(!acceptsPublicOrigin(request,config))return failure(403,"forbidden");
 let ip:string;try{ip=visitorIp(request);}catch{return failure(403,"forbidden");}
 const incoming=new URL(request.url),query=new URLSearchParams();for(const key of incoming.searchParams.keys()){if(!operation.query?.includes(key)||incoming.searchParams.getAll(key).length!==1)return failure(400,"invalid_request");const value=incoming.searchParams.get(key)!;if(value.length>200)return failure(400,"invalid_request");query.set(key,value);}
 const headers=new Headers({Accept:"application/json","X-Contact-Key":stringValue(config,"CONTACT_SERVICE_KEY"),"X-Contact-Origin":origin,"X-Contact-Visitor-IP":ip});
 if(operation.capability){const value=request.headers.get("x-form-capability")??"";if(!/^[A-Za-z0-9_-]{43}$/.test(value))return failure(404,"not_found");headers.set("X-Form-Capability",value);}
 if(operation.proof){const value=request.headers.get("idempotency-key")??"";if(!/^[0-9a-f]{64}$/.test(value))return failure(400,"invalid_request");headers.set("Idempotency-Key",value);}
 let body:unknown;if(operation.bodySchema||operation.emptyBody){if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return failure(415,"unsupported_media_type");try{body=await read(request.body,1_000_000);}catch(error){return failure(error instanceof Error&&error.message==="limit"?413:400,error instanceof Error&&error.message==="limit"?"payload_too_large":"invalid_request");}if(operation.emptyBody?(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).length!==0):!valid(operation.bodySchema!,body))return failure(400,"validation_error");}
 try{
  if(operation.bodySchema||operation.emptyBody)headers.set("Content-Type","application/json");
  const response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+"/v1/internal/forms"+operation.path+(query.size?"?"+query.toString():""),{method:operation.method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))});
  if(response.status===204&&operation.method==="DELETE"){await response.body?.cancel();return new Response(null,{status:204,headers:privateHeaders});}
  if(response.headers.get("content-type")?.split(";")[0]!=="application/json")throw new Error();const output=await read(response.body,response.ok?2_000_000:262144);
  if(!valid(response.ok?operation.responseSchema:"FormsError",output)||![200,201,202,400,401,403,404,409,410,412,413,415,422,428,429,503].includes(response.status))throw new Error();
  const outHeaders=new Headers(privateHeaders),retry=response.headers.get("retry-after");if(retry&&/^[1-9][0-9]{0,5}$/.test(retry))outHeaders.set("Retry-After",retry);
  return Response.json(output,{status:response.status,headers:outHeaders});
 }catch{return failure(503,"form_unavailable");}
}
