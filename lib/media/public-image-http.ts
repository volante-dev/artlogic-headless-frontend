import 'server-only';
import{loadConfig,stringValue,numberValue,listValue}from'../config/env';
import{privateHeaders,PublicApiError}from'../api/client';
import{parseImageQuery,imageUUID,type ImageResource}from'./public-image-url';
import{validateImageDescriptor}from'./public-image-descriptor';
import{validateImageGrant}from'./public-image-authorization';
import{publicImageCacheHeaders}from'./public-image-cache';
const apiRoots={artwork:'media',siteLogo:'site-logos',presentation:'presentation-assets',editorial:'editorial/media'};
export async function imageApi(path:string,body?:unknown,signal?:AbortSignal){
 if(!/^\/v1\/public\/(?:(?:media|site-logos|presentation-assets|editorial\/media)\/[a-f0-9-]{36}\/image-authorization\?rendition=[a-z0-9-]+&version=[a-zA-Z0-9._%-]+|image-descriptors\/query|image-observations)$/.test(path))throw Error('invalid_image_path');
 const config=loadConfig(),timeout=path.endsWith('/image-descriptors/query')?numberValue(config,'PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS'):numberValue(config,'PUBLIC_PAGE_REQUEST_TIMEOUT_MS');
 const response=await fetch(stringValue(config,'BACKEND_URL').replace(/\/$/,'')+path,{method:body===undefined?'GET':'POST',body:body===undefined?undefined:JSON.stringify(body),headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},credentials:'omit',redirect:'error',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(timeout)]):AbortSignal.timeout(timeout)});
 if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,413,429].includes(response.status)?response.status:503,'image_request_failed');}
 if(response.status===204){await response.body?.cancel();return null;}
 if(response.headers.get('content-type')?.split(';')[0]!=='application/json')throw Error('invalid_image_response');
 const reader=response.body?.getReader();if(!reader)throw Error();let size=0;const chunks:Uint8Array[]=[];try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>131072)throw Error('image_response_too_large');chunks.push(chunk.value);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}finally{await reader.cancel().catch(()=>{});}
}
export async function relayResponsiveImage(request:Request,id:string,kind:ImageResource['resourceKind'],head=false){
 try{
  if(!imageUUID.test(id))throw new PublicApiError(400,'invalid_request');const resource={resourceKind:kind,resourceId:id.toLowerCase()},q=parseImageQuery(new URL(request.url));
  if(head){const result=await imageApi('/v1/public/image-descriptors/query',{resources:[resource]},request.signal);const item=result?.items?.find((x:{resource?:ImageResource})=>x.resource?.resourceKind===kind&&x.resource?.resourceId===resource.resourceId);if(item?.availability!=='available'||item.descriptor?.sourceVersion!==q.version)throw new PublicApiError(404,'not_found');
   const descriptor=validateImageDescriptor(item.descriptor,resource);const candidate=descriptor.candidates.find(c=>c.rendition===q.rendition);const mime=q.rendition==='r1-reference'||descriptor.candidates.every(c=>c.mode==='reference')?descriptor.source.mimeType:candidate?.mode==='reference'?descriptor.source.mimeType:undefined;if(mime&&!['image/webp','image/jpeg','image/png','image/gif','image/svg+xml'].includes(mime))throw Error();return new Response(null,{status:200,headers:{...privateHeaders,...(mime?{'Content-Type':mime}:{})}});
  }
  const value=await imageApi('/v1/public/'+apiRoots[kind]+'/'+resource.resourceId+'/image-authorization?rendition='+q.rendition+'&version='+encodeURIComponent(q.version),undefined,request.signal),grant=validateImageGrant(value,resource,q.version,q.rendition,listValue(loadConfig(),'PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON'));
  return new Response(null,{status:307,headers:{...privateHeaders,...publicImageCacheHeaders(grant.delivery.expiresAt),Location:grant.delivery.url}});
 }catch(e){const status=e instanceof PublicApiError?e.status:e instanceof Error&&e.message==='invalid_request'?400:503;return head?new Response(null,{status,headers:privateHeaders}):Response.json({error:{code:status===404?'not_found':status===400?'invalid_request':'service_unavailable'}},{status,headers:privateHeaders});}
}
