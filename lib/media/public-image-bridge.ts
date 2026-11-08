import 'server-only';
import{privateHeaders,PublicApiError}from'../api/client';
import{imageApi}from'./public-image-http';
import{imageUUID}from'./public-image-url';
import{validateImageObservation}from'./image-observations';
export async function imageBridge(request:Request,kind:'descriptors'|'observations'){
 let validated=false;try{
  if(request.headers.get('origin')!==new URL(request.url).origin)return new Response(null,{status:403,headers:privateHeaders});
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw Error();
  const reader=request.body?.getReader();if(!reader)throw Error();const limit=kind==='descriptors'?8192:2048;let size=0;const chunks:Uint8Array[]=[];
  try{for(;;){const c=await reader.read();if(c.done)break;size+=c.value.length;if(size>limit)return new Response(null,{status:413,headers:privateHeaders});chunks.push(c.value);}}finally{await reader.cancel().catch(()=>{});}
  const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(kind==='observations')validateImageObservation(value);else if(!value||Object.keys(value).join(',')!=='resources'||!Array.isArray(value.resources)||value.resources.length<1||value.resources.length>32||value.resources.some((r:{resourceKind:string;resourceId:string})=>!r||Object.keys(r).sort().join(',')!=='resourceId,resourceKind'||!['artwork','siteLogo','presentation','editorial'].includes(r.resourceKind)||!imageUUID.test(r.resourceId)))throw Error();
  validated=true;const result=await imageApi('/v1/public/'+(kind==='descriptors'?'image-descriptors/query':'image-observations'),value,request.signal);return kind==='observations'?new Response(null,{status:204,headers:privateHeaders}):Response.json(result,{headers:privateHeaders});
 }catch(e){return new Response(null,{status:e instanceof PublicApiError?e.status:validated?503:400,headers:privateHeaders});}
}
