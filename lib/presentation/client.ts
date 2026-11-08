import "server-only";
import {diagnosticId,failureKind,presentationReadLog,type PresentationReadEvent} from "./diagnostics";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {PublicApiError} from "../api/client";
import {pageKeys,type PageKey} from "./types";
import {validatePresentationAddress,validatePublicPresentation} from "./validate-response";

export async function getPublicPresentation(pageKey:PageKey,locale:string,expectedReleaseId?:string,renderId?:string){
  const config=loadConfig();
  if(!pageKeys.includes(pageKey)||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale)||locale.length>35)throw new PublicApiError(400,"invalid_request");
  const query=new URLSearchParams({pageKey,locale});if(expectedReleaseId)query.set("expectedReleaseId",expectedReleaseId);
  return presentationJson("presentation",query,locale,raw=>validatePublicPresentation(raw,{profileId:stringValue(config,"SITE_PROFILE"),pageKey,locale}),pageKey,renderId);
}

async function presentationJson<T>(operation:'presentation'|'page-address',query:URLSearchParams,locale:string,validate:(raw:unknown)=>T,pageKey?:string,renderId?:string):Promise<T>{
 const config=loadConfig(),readId=crypto.randomUUID(),timeoutMs=numberValue(config,"PUBLIC_PAGE_REQUEST_TIMEOUT_MS"),started=performance.now();
 const base={readId,operation,timeoutMs,pageKey,locale,renderId:diagnosticId(renderId)};
 const log=(phase:PresentationReadEvent['phase'],extra:Partial<PresentationReadEvent>={})=>presentationReadLog({...base,phase,durationMs:performance.now()-started,...extra});
 log('start');
 let response:Response;
 try{response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+"/v1/public/presentation"+(operation==='page-address'?"/page-address":"")+"?"+query,{headers:{Accept:"application/json","X-Presentation-Read-Id":readId},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(timeoutMs)});}
 catch(error){log('fetch',failureKind(error));throw new PublicApiError(503,"presentation_unavailable");}
 const headersMs=performance.now()-started;
 const upstream={headersMs,apiInstanceId:diagnosticId(response.headers.get('x-api-instance-id')),apiInitializationId:diagnosticId(response.headers.get('x-api-initialization-id')),status:response.status,apiRequestId:diagnosticId(response.headers.get('x-request-id')),apiEdgeId:diagnosticId(response.headers.get('x-vercel-id'))};
 if(operation==='presentation'?response.status!==200:!response.ok){log('http',upstream);await response.body?.cancel();throw new PublicApiError([400,404,409,429].includes(response.status)?response.status:503,response.status===404?"not_found":"presentation_unavailable");}
 const reader=response.body?.getReader();if(!reader){log('body',upstream);throw new PublicApiError(503,"invalid_response");}
 let phase:PresentationReadEvent['phase']='body',bytes=0;
 try{
  const bodyStarted=performance.now();const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>10485760)throw new Error();chunks.push(part.value);}
  const bodyMs=performance.now()-bodyStarted;phase='json';const jsonStarted=performance.now(),raw:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8')),jsonMs=performance.now()-jsonStarted;
  phase='validation';const validationStarted=performance.now(),result=validate(raw);log('complete',{...upstream,bytes,bodyMs,jsonMs,validationMs:performance.now()-validationStarted});return result;
 }catch(error){log(phase,{...upstream,bytes,...failureKind(error)});throw new PublicApiError(503,operation==='presentation'?"presentation_configuration_mismatch":"invalid_response");}
 finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}

export async function getPresentationAddress(slug:string,locale:string){
 const config=loadConfig(),query=new URLSearchParams({slug,locale});
 return presentationJson('page-address',query,locale,raw=>validatePresentationAddress(raw,{profileId:stringValue(config,"SITE_PROFILE"),locale}));
}
