import "server-only";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {previewHandle} from "./preview-cookies";
import {previewHeaders,previewFailure} from "./preview-client";
import {privateHeaders,uuidPattern} from "../api/client";

export const relayPublicAsset=(request:Request,id:string)=>relayAsset(request,id);
export async function relayPreviewAsset(request:Request,id:string){try{return await relayAsset(request,id,await previewHandle());}catch(error){return previewFailure(error,request.method==="HEAD");}}
async function relayAsset(request:Request,id:string,handle?:string):Promise<Response>{
  const head=request.method==="HEAD",headers=new Headers(handle?previewHeaders:privateHeaders),abort=new AbortController();
  function error(status:number){return new Response(head?null:JSON.stringify({error:{code:status===404?"not_found":status===416?"range_not_satisfiable":status===400?"invalid_request":"service_unavailable"}}),{status,headers:new Headers({...Object.fromEntries(headers),"Content-Type":"application/json"})});}
  if(!uuidPattern.test(id))return error(404);
  const query=new URL(request.url).searchParams,variant=query.get("variant"),range=request.headers.get("range");
  if([...query.keys()].some(key=>key!=="variant")||query.getAll("variant").length>1||variant!==null&&!["original","w640","w1280","w1920"].includes(variant)||range!==null&&range.length>120)return error(400);
  const config=loadConfig(),signal=AbortSignal.any([request.signal,abort.signal,AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))]);
  try{
    const response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+(handle?"/v1/preview/assets/":"/v1/public/presentation-assets/")+id+"/authorization"+(variant?"?variant="+variant:""),{method:"GET",headers:{Accept:"application/json",...(handle?{"X-Preview-Key":stringValue(config,"PREVIEW_SERVICE_KEY"),"X-Preview-Session":handle}:{})},cache:"no-store",redirect:"error",signal});
    if(!response.ok){await response.body?.cancel();const status=[400,401,403,404,429].includes(response.status)?response.status:503;const retry=response.headers.get("retry-after");if(status===429&&retry&&/^\d{1,6}$/.test(retry))headers.set("Retry-After",retry);return error(status);}
    if(response.headers.get("content-type")?.split(";")[0]!=="application/json"){await response.body?.cancel();return error(503);}
    const reader=response.body?.getReader();if(!reader)return error(503);
    let data:{url?:unknown;expiresAt?:unknown};
    try{let size=0;const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>16384)throw new Error();chunks.push(part.value);}data=JSON.parse(Buffer.concat(chunks).toString("utf8"));}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
    if(typeof data.url!=="string"||data.url.length>8192||typeof data.expiresAt!=="string")return error(503);
    const url=new URL(data.url),ttl=Date.parse(data.expiresAt)-Date.now();
    if(url.username||url.password||url.hash||!url.pathname.includes("/storage/v1/object/sign/")||!url.searchParams.has("token")||!(ttl>0&&ttl<=65000)||url.protocol!=="https:"&&!(config.DATA_MODE==="mock"&&url.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(url.hostname)))return error(503);
    headers.set("Location",url.toString());return new Response(null,{status:307,headers});
  }catch{abort.abort();headers.delete("Content-Length");return error(503);}
}
