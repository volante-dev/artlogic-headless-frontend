import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {privateHeaders,PublicApiError,uuidPattern} from "../api/client";
/** The only destination is the configured backend. An authorization never supplies a URL. */
export async function relayInventoryPublicMedia(request:Request,id:string,sourceVersion:string,rendition:string,head=false){
 if(!uuidPattern.test(id)||sourceVersion!==id+".ref"||!/^r1-(reference|w(?:64|96|128|160|256|320|480|640|768|960|1280|1600|1920|2500))$/.test(rendition))throw new PublicApiError(404,"not_found");
 const config=loadConfig(),path="/v1/public/inventory/media/"+id+"?rendition="+rendition+"&version="+encodeURIComponent(sourceVersion),response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{method:head?"HEAD":"GET",headers:{Accept:"image/webp"},credentials:"omit",redirect:"error",cache:"no-store",signal:AbortSignal.any([request.signal,AbortSignal.timeout(numberValue(config,"PUBLIC_PAGE_REQUEST_TIMEOUT_MS"))])});
 if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,429].includes(response.status)?response.status:503,"native_media_unavailable");}
 const length=response.headers.get("content-length");if(response.headers.get("content-type")?.split(";")[0]!=="image/webp"||length!==null&&(!/^[1-9][0-9]*$/.test(length)||Number(length)>25000000)){await response.body?.cancel();throw new PublicApiError(503,"invalid_response");}
 const headers=new Headers({...privateHeaders,"Content-Type":"image/webp"});if(length)headers.set("Content-Length",length);if(head){await response.body?.cancel();return new Response(null,{status:200,headers});}
 const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");let total=0;
 const stream=new ReadableStream<Uint8Array>({async pull(controller){try{const value=await reader.read();if(value.done){if(length!==null&&total!==Number(length))throw Error("native_media_size_mismatch");controller.close();reader.releaseLock();return;}total+=value.value.byteLength;if(total>25000000||length!==null&&total>Number(length))throw Error("native_media_too_large");controller.enqueue(value.value);}catch(error){await reader.cancel().catch(()=>{});reader.releaseLock();controller.error(error);}},async cancel(){await reader.cancel().catch(()=>{});reader.releaseLock();}});
 return new Response(stream,{status:200,headers});
}
