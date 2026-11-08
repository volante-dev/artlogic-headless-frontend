import {loadConfig,stringValue,numberValue} from "@/lib/config/env";
import {privateHeaders} from "@/lib/api/client";
import {validateMediaObservation} from "@/lib/media/validate-observation";
export async function POST(request:Request){
 let validated=false;
 try{
  if(request.headers.get("origin")!==new URL(request.url).origin)return new Response(null,{status:403,headers:privateHeaders});
  if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return new Response(null,{status:400,headers:privateHeaders});
  const reader=request.body?.getReader();if(!reader)throw Error();let size=0;const chunks:Uint8Array[]=[];
  try{for(;;){const c=await reader.read();if(c.done)break;size+=c.value.length;if(size>2048)return new Response(null,{status:413,headers:privateHeaders});chunks.push(c.value);}}finally{await reader.cancel().catch(()=>{});}
  const body=validateMediaObservation(JSON.parse(Buffer.concat(chunks).toString("utf8")));validated=true;const config=loadConfig();
  const response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+"/v1/public/media-observations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",redirect:"error",credentials:"omit",signal:AbortSignal.timeout(Math.min(5000,numberValue(config,"PUBLIC_PAGE_REQUEST_TIMEOUT_MS")))});
  await response.body?.cancel();return new Response(null,{status:response.status===204?204:[400,413,429].includes(response.status)?response.status:503,headers:privateHeaders});
 }catch{return new Response(null,{status:validated?503:400,headers:privateHeaders});}
}
