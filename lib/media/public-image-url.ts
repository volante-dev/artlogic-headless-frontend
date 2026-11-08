import type{components}from'../api/generated';
import{imageRenditions}from'./public-image-policy.generated';
export type ImageResource=components['schemas']['ImageResource'];
export type ImageDescriptor=components['schemas']['PublicImageDescriptor'];
const roots={artwork:'media',siteLogo:'site-logos',presentation:'presentation-assets',editorial:'editorial-assets'} as const;
export const imageUUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function imageUrl(resource:ImageResource,version:string,rendition:string,retry=false){
 if(!imageUUID.test(resource.resourceId)||!imageRenditions.includes(rendition)||!/^[a-zA-Z0-9._-]{1,128}$/.test(version))throw Error('invalid_image_reference');
 return '/'+roots[resource.resourceKind]+'/'+resource.resourceId.toLowerCase()+'?image='+rendition+'&v='+encodeURIComponent(version)+(retry?'&retry=1':'');
}
export function referenceImagePath(resource:ImageResource){return '/'+roots[resource.resourceKind]+'/'+resource.resourceId.toLowerCase();}
export function parseImageQuery(url:URL){
 const q=url.searchParams;if([...q.keys()].some(k=>!['image','v','retry'].includes(k)||q.getAll(k).length!==1))throw Error('invalid_request');
 const rendition=q.get('image'),version=q.get('v'),retry=q.get('retry');if(!rendition||!imageRenditions.includes(rendition)||!version||!/^[a-zA-Z0-9._-]{1,128}$/.test(version)||retry!==null&&retry!=='1')throw Error('invalid_request');return {rendition,version,retry:retry==='1'};
}
export function buildImageAttributes(d:ImageDescriptor,sizes:string){
 const reference=d.candidates.find(c=>c.mode==='reference')??d.candidates.at(-1)!;
 return {src:imageUrl(d,d.sourceVersion,reference.rendition),srcSet:d.candidates.map(c=>imageUrl(d,d.sourceVersion,c.rendition)+' '+c.expectedWidth+'w').join(', '),sizes};
}

export function publicImageResource(path:string):ImageResource|undefined{
 const match=/^\/(media|site-logos|presentation-assets|editorial-assets)\/([a-f0-9-]{36})(?:\?variant=(?:original|w640|w1280|w1920))?$/i.exec(path);if(!match)return;
 return {resourceKind:({'media':'artwork','site-logos':'siteLogo','presentation-assets':'presentation','editorial-assets':'editorial'} as const)[match[1] as 'media'|'site-logos'|'presentation-assets'|'editorial-assets'],resourceId:match[2].toLowerCase()};
}
