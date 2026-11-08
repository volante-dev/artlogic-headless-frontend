import 'server-only';
import{loadConfig,numberValue}from'../config/env';
import{imageApi}from'./public-image-http';
import{publicImageResource,type ImageDescriptor,type ImageResource}from'./public-image-url';
import{validateImageDescriptor}from'./public-image-descriptor';
export async function nativeImageDescriptors(document:unknown):Promise<Record<string,ImageDescriptor>>{
 const config=loadConfig();if(config.PUBLIC_IMAGE_RESPONSIVE_ENABLED!=='true')return {};
 const resources=new Map<string,{path:string;resource:ImageResource}>();
 const scan=(v:unknown)=>{if(!v||typeof v!=='object')return;for(const [key,x]of Object.entries(v)){if(key==='srcPath'&&typeof x==='string'){const r=publicImageResource(x);if(r)resources.set(r.resourceKind+':'+r.resourceId,{path:x,resource:r});}else if(x&&typeof x==='object')scan(x);}};scan(document);
 const result:Record<string,ImageDescriptor>={},queue=[...resources.values()],signal=AbortSignal.timeout(numberValue(config,'PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS'));
 const worker=async()=>{while(queue.length&&!signal.aborted){const batch=queue.splice(0,32);try{const value=await imageApi('/v1/public/image-descriptors/query',{resources:batch.map(x=>x.resource)},signal);for(const entry of batch){const item=value?.items?.find((i:{resource?:ImageResource})=>i.resource?.resourceKind===entry.resource.resourceKind&&i.resource?.resourceId===entry.resource.resourceId);if(item?.availability==='available')result[entry.path]=validateImageDescriptor(item.descriptor,entry.resource);}}catch{/* Missing metadata is a local reference fallback. */}}};
 await Promise.all([worker(),worker()]);return result;
}
