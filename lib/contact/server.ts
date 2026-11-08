import "server-only";
import {randomUUID} from "node:crypto";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {privateHeaders,uuidPattern} from "../api/client";
import {visitorIp} from "./network-context";
import {acceptsPublicOrigin} from "./public-origin";
import type {ContactConfiguration} from "./types";
import {contactArtworkFromExperience,isContactArtworkId} from "./artwork";
const responseLimit=262144,bodyLimit=98304;
const codes:Record<number,readonly string[]>={400:["validation_error","invalid_request"],401:["unauthorized"],403:["forbidden"],404:["not_found"],409:["idempotency_conflict"],413:["payload_too_large"],415:["unsupported_media_type"],429:["rate_limited"],503:["contact_disabled","contact_unavailable"]};
const fields=new Set(["name","email","subject","message","locale","artworkId","proof","website"]),reasons=new Set(["required","invalid","too_long","unsupported","conflict"]);
function object(v:unknown):v is Record<string,unknown>{return Boolean(v)&&typeof v==="object"&&!Array.isArray(v);}
export function contactFailure(status:number,code:string,requestId:string=randomUUID(),details?:{field:string;reason:string}[],retryAfter?:string){
 return Response.json({error:{code,message:"La demande ne peut pas être confirmée.",requestId,...(details?.length?{details}: {})}},{status,headers:{...privateHeaders,...(retryAfter?{"Retry-After":retryAfter}:{})}});
}
async function bytes(stream:ReadableStream<Uint8Array>|null,limit:number){if(!stream)throw new Error("contact_empty_body");const reader=stream.getReader(),chunks:Uint8Array[]=[];let size=0;try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>limit)throw new Error("contact_body_limit");chunks.push(part.value);}return Buffer.concat(chunks);}finally{await reader.cancel().catch(()=>{});}}
async function call(path:"config"|"inquiries"|"receipt",input?:{body:unknown;ip:string}){
 const c=loadConfig(),headers=new Headers({Accept:"application/json","X-Contact-Key":stringValue(c,"CONTACT_SERVICE_KEY")});
 if(input){headers.set("Content-Type","application/json");headers.set("X-Contact-Origin",stringValue(c,"SITE_ORIGIN"));headers.set("X-Contact-Visitor-IP",input.ip);}
 const response=await fetch(stringValue(c,"BACKEND_URL").replace(/\/$/,"")+"/v1/internal/contact/"+path,{method:input?"POST":"GET",headers,body:input?JSON.stringify(input.body):undefined,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(c,"REQUEST_TIMEOUT_MS"))});
 if(response.headers.get("content-type")?.split(";")[0]!=="application/json")throw new Error("contact_invalid_response");
 const body:unknown=JSON.parse((await bytes(response.body,responseLimit)).toString("utf8"));return {response,body};
}
function configuration(v:unknown):ContactConfiguration{
 if(!object(v)||typeof v.enabled!=="boolean"||!(v.privacyUrl===null||typeof v.privacyUrl==="string")||v.proofTtlSeconds!==86400||!object(v.limits)||v.limits.name!==120||v.limits.email!==254||v.limits.subject!==160||v.limits.message!==5000)throw new Error("contact_invalid_config");
 if(typeof v.privacyUrl==="string"){const url=new URL(v.privacyUrl);if(!["http:","https:"].includes(url.protocol)||url.username||url.password)throw new Error("contact_invalid_privacy_url");}
 return {enabled:v.enabled,privacyUrl:v.privacyUrl,proofTtlSeconds:86400,limits:{name:120,email:254,subject:160,message:5000}};
}
export async function readContactConfiguration():Promise<ContactConfiguration|null>{try{const result=await call("config");if(!result.response.ok)return null;const config=configuration(result.body);return {...config,enabled:config.enabled&&loadConfig().CONTACT_ENABLED==="true"};}catch{return null;}}
export async function contactConfigResponse(){const config=await readContactConfiguration();return config?Response.json(config,{headers:privateHeaders}):contactFailure(503,"contact_unavailable");}
export async function relayContact(request:Request,path:"inquiries"|"receipt"){
 const c=loadConfig();if(!acceptsPublicOrigin(request,c))return contactFailure(403,"forbidden");
 let ip:string;try{ip=visitorIp(request);}catch{return contactFailure(403,"forbidden");}
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return contactFailure(415,"unsupported_media_type");
 let body:unknown;try{body=JSON.parse((await bytes(request.body,bodyLimit)).toString("utf8"));}catch(e){return contactFailure(e instanceof Error&&e.message==="contact_body_limit"?413:400,e instanceof Error&&e.message==="contact_body_limit"?"payload_too_large":"validation_error");}
 try{
  const result=await call(path,{body,ip});if(result.response.ok){if(!object(result.body)||result.body.accepted!==true||typeof result.body.reference!=="string"||!uuidPattern.test(result.body.reference))throw new Error();return Response.json({accepted:true,reference:result.body.reference},{status:path==="inquiries"?202:200,headers:privateHeaders});}
  const value=object(result.body)&&object(result.body.error)?result.body.error:null,code=value?.code,status=result.response.status;
  if(typeof code!=="string"||!codes[status]?.includes(code))throw new Error();
  const requestId=typeof value?.requestId==="string"&&uuidPattern.test(value.requestId)?value.requestId:randomUUID();
  const details=Array.isArray(value?.details)?value.details.slice(0,10).flatMap(v=>object(v)&&typeof v.field==="string"&&fields.has(v.field)&&typeof v.reason==="string"&&reasons.has(v.reason)?[{field:v.field,reason:v.reason}]:[]):undefined;
  const retry=result.response.headers.get("retry-after");return contactFailure(status,code,requestId,details,retry&&/^[1-9][0-9]{0,5}$/.test(retry)?retry:undefined);
 }catch{return contactFailure(503,"contact_unavailable");}
}

export async function readContactArtwork(id:string,locale:string,defaultLocale:string,untitled:string){
 if(!isContactArtworkId(id))return null;
 try{const {getGalleryExperience}=await import("../artworks/server");return contactArtworkFromExperience(await getGalleryExperience(id,locale),untitled,defaultLocale);}catch{return null;}
}
