import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {PublicApiError} from "../api/client";
import {pageKeys,type PageKey} from "./types";
import {validatePublicPresentation} from "./validate-response";

export async function getPublicPresentation(pageKey:PageKey,locale:string){
  const config=loadConfig();
  if(!pageKeys.includes(pageKey)||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale)||locale.length>35)throw new PublicApiError(400,"invalid_request");
  const query=new URLSearchParams({pageKey,locale});
  let response:Response;
  try{response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+"/v1/public/presentation?"+query,{headers:{Accept:"application/json"},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))});}
  catch{throw new PublicApiError(503,"presentation_unavailable");}
  if(response.status!==200){await response.body?.cancel();throw new PublicApiError([400,404,429].includes(response.status)?response.status:503,response.status===404?"not_found":"presentation_unavailable");}
  const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
  try{
    const chunks:Uint8Array[]=[];let size=0;
    for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>10485760)throw new Error();chunks.push(part.value);}
    const raw:unknown=JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return validatePublicPresentation(raw,{profileId:stringValue(config,"SITE_PROFILE"),pageKey,locale});
  }catch{throw new PublicApiError(503,"presentation_configuration_mismatch");}
  finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
