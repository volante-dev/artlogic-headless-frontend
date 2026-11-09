import type {ImageDescriptor,ImageResource} from './public-image-url';
export interface ImageDescriptors {
 requestDescriptor(resource:ImageResource,eager?:boolean):Promise<ImageDescriptor|undefined>;
 peek?(resource:ImageResource):ImageDescriptor|undefined;
}
/** Metadata for one immutable article projection, not a publication or signed-URL cache. */
export class ImageDescriptorSession implements ImageDescriptors {
 private readonly resolved=new Map<string,ImageDescriptor>();
 private readonly pending=new Map<string,Promise<ImageDescriptor|undefined>>();
 constructor(private readonly parent:ImageDescriptors){}
 private key(resource:ImageResource){return resource.resourceKind+':'+resource.resourceId;}
 peek(resource:ImageResource){return this.resolved.get(this.key(resource));}
 requestDescriptor(resource:ImageResource,eager=false):Promise<ImageDescriptor|undefined>{
  const key=this.key(resource),cached=this.resolved.get(key);if(cached)return Promise.resolve(cached);
  const existing=this.pending.get(key);if(existing)return existing;
  const request=this.parent.requestDescriptor(resource,eager).then(descriptor=>{
   if(descriptor){this.resolved.set(key,descriptor);if(this.resolved.size>256)this.resolved.delete(this.resolved.keys().next().value!);}return descriptor;
  }).finally(()=>{this.pending.delete(key);});this.pending.set(key,request);return request;
 }
}
