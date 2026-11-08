import "server-only";
import {configuredLocalePolicy,loadConfig,stringValue,numberValue} from "../config/env";
import {PublicApiError} from "../api/client";
import {validateNavigation} from "./validate";
import type {NavigationPublicProjection} from "./types";
export async function getPublicNavigation(locale:string,releaseId:string):Promise<NavigationPublicProjection>{
 const config=loadConfig(),query=new URLSearchParams({locale,expectedReleaseId:releaseId});
 let response:Response;try{response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+"/v1/public/navigation?"+query,{headers:{Accept:"application/json"},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(config,"PUBLIC_PAGE_REQUEST_TIMEOUT_MS"))});}catch{throw new PublicApiError(503,"navigation_unavailable");}
 if(response.status!==200){await response.body?.cancel();throw new PublicApiError(response.status===409?409:503,"navigation_unavailable");}
 const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
 try{const parts:Uint8Array[]=[];let size=0;for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>8192)throw new Error();parts.push(part.value);}return validateNavigation(JSON.parse(Buffer.concat(parts).toString("utf8")),{scope:"public",locale,id:releaseId,policy:configuredLocalePolicy(config)}) as NavigationPublicProjection;}catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
