import type {components} from '../api/generated';
import {physicalImageDescriptor} from '../media/public-image-descriptor';
import {publicImageResource,type ImageDescriptor} from '../media/public-image-url';
type Metadata=components['schemas']['EditorialImageMetadata'];
export function editorialImageDescriptor(path:string,image?:Metadata):ImageDescriptor|undefined{
 const resource=publicImageResource(path);
 return resource&&image?physicalImageDescriptor(resource,image,image.sourceVersion):undefined;
}
/** The published projection already includes these immutable facts; no client query. */
export function editorialImageDescriptors(article:unknown){
 const result=new Map<string,ImageDescriptor>();
 const scan=(value:unknown)=>{if(!value||typeof value!=='object')return;const object=value as Record<string,unknown>;
  if(typeof object.srcPath==='string'&&object.image){const d=editorialImageDescriptor(object.srcPath,object.image as Metadata);if(d)result.set(d.resourceKind+':'+d.resourceId,d);}
  for(const item of Object.values(object))if(item&&typeof item==='object')scan(item);
 };scan(article);return result;
}
