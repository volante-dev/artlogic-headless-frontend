import "server-only";
import {Ajv2020} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {PublicApiError,uuidPattern} from "../api/client";
import {previewHandle} from "../presentation/preview-cookies";
import {editorialPublicSchemas} from "./schemas.generated";
import type {components} from "../api/generated";
const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false});(addFormats as unknown as (value:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});
const validate=ajv.compile(editorialPublicSchemas.EditorialPreviewArticle);
export async function editorialPreviewFetch(snapshotId:string,assetId?:string,variant?:string){
 if(!uuidPattern.test(snapshotId)||assetId!==undefined&&!uuidPattern.test(assetId)||variant!==undefined&&!["original","w640","w1280","w1920"].includes(variant))throw new PublicApiError(404,"not_found");
 const config=loadConfig(),handle=await previewHandle(),path="/v1/preview/editorial/snapshots/"+snapshotId+(assetId?"/media/"+assetId+"/authorization":"")+(variant?"?variant="+variant:"");let response:Response;
 try{response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{headers:{Accept:"application/json","X-Preview-Key":stringValue(config,"PREVIEW_SERVICE_KEY"),"X-Preview-Session":handle},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))});}catch{throw new PublicApiError(503,"preview_unavailable");}
 if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,401,403,404,429].includes(response.status)?response.status:503,"preview_unavailable");}if(response.headers.get("content-type")?.split(";")[0]!=="application/json"){await response.body?.cancel();throw new PublicApiError(503,"invalid_response");}
 const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");try{let size=0;const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>(assetId?16384:2097152))throw new Error();chunks.push(part.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;}catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
export async function readEditorialPreview(snapshotId:string){const value=await editorialPreviewFetch(snapshotId);if(!validate(value))throw new PublicApiError(503,"invalid_response");return value as components["schemas"]["EditorialPreviewArticle"];}
