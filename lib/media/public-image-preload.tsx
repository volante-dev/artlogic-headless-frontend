import 'server-only';
import{loadConfig}from'../config/env';
import{physicalImageDescriptor}from'./public-image-descriptor';
import{buildImageAttributes}from'./public-image-url';
import{detailImageSizes}from'./public-image-sizes';
export function PublicImagePreload({media}:{media?:{id:string;width:number;height:number}}){
 if(loadConfig().PUBLIC_IMAGE_RESPONSIVE_ENABLED!=='true'||!media)return null;
 const resource={resourceKind:'artwork' as const,resourceId:media.id},descriptor=physicalImageDescriptor(resource,{width:media.width,height:media.height,mimeType:'image/webp'},media.id+'.ref');if(!descriptor)return null;
 const props=buildImageAttributes(descriptor,detailImageSizes(media.width/media.height));return <link rel='preload' as='image' href={props.src} imageSrcSet={props.srcSet} imageSizes={props.sizes} fetchPriority='high'/>;
}
