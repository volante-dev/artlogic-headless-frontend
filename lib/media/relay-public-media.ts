import "server-only";
import {loadConfig,listValue} from "../config/env";
import {publicFetch,PublicApiError,privateHeaders,uuidPattern} from "../api/client";
import {validatePublicMediaGrant,parseDisplayQuery} from "./public-authorization";
export async function relayPublicMedia(request:Request,id:string,resourceKind:"artwork"|"siteLogo",head=false){
 const started=performance.now();
 try{
  if(!uuidPattern.test(id))throw new PublicApiError(404,"not_found");id=id.toLowerCase();
  let display:ReturnType<typeof parseDisplayQuery>;try{display=parseDisplayQuery(new URL(request.url));}catch{throw new PublicApiError(400,"invalid_request");}
  const config=loadConfig(),direct=config.PUBLIC_MEDIA_DIRECT_ENABLED==="true",path="/v1/public/"+(resourceKind==="artwork"?"media/":"site-logos/")+id;
  const response=await publicFetch(path+(direct&&!head?"/authorization":""),request.signal,{method:head?"HEAD":"GET",displayId:display.displayId??undefined});
  if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,429].includes(response.status)?response.status:503,"service_unavailable");}
  if(head){await response.body?.cancel();const headers=new Headers({...privateHeaders,"Content-Type":"image/webp"}),length=response.headers.get("content-length");if(length&&/^\d+$/.test(length))headers.set("Content-Length",length);return new Response(null,{status:200,headers});}
  if(direct){
   const reader=response.body?.getReader();if(!reader)throw Error();let size=0;const chunks:Uint8Array[]=[];
   try{for(;;){const c=await reader.read();if(c.done)break;size+=c.value.length;if(size>16384)throw Error();chunks.push(c.value);}}finally{await reader.cancel().catch(()=>{});}
   const grant=validatePublicMediaGrant(JSON.parse(Buffer.concat(chunks).toString("utf8")),id,listValue(config,"PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON"));
   console.info(JSON.stringify({event:"public_media_authorization",resourceKind,resourceId:id,displayId:display.displayId,retry:display.retry,result:"authorized",durationMs:Math.round(performance.now()-started),expiresAt:grant.expiresAt,readId:uuidPattern.test(response.headers.get("x-request-id")??"")?response.headers.get("x-request-id"):undefined}));
   return new Response(null,{status:307,headers:{...privateHeaders,Location:grant.url}});
  }
  if(!response.body||response.headers.get("content-type")?.split(";")[0]!=="image/webp"){await response.body?.cancel();throw Error();}
  const headers=new Headers({...privateHeaders,"Content-Type":"image/webp"}),length=response.headers.get("content-length");if(length&&/^\d+$/.test(length))headers.set("Content-Length",length);
  return new Response(response.body,{status:200,headers});
 }catch(error){const status=error instanceof PublicApiError?error.status:503;console.info(JSON.stringify({event:"public_media_authorization",resourceKind,resourceId:uuidPattern.test(id)?id:undefined,result:"failed",status,durationMs:Math.round(performance.now()-started)}));return head?new Response(null,{status,headers:privateHeaders}):Response.json({error:{code:status===404?"not_found":status===400?"invalid_request":"service_unavailable"}},{status,headers:privateHeaders});}
}
