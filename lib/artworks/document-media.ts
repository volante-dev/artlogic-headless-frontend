import type {ArtworkDocumentSnapshot} from './document-content';
import {physicalImageDescriptor} from '../media/public-image-descriptor';
import {buildImageAttributes} from '../media/public-image-url';
export function artworkDocumentImage(media:ArtworkDocumentSnapshot['artwork']['media'][number],responsive=false){
 if(!responsive)return {src:'/media/'+media.id,srcSet:undefined,sizes:undefined};
 const descriptor=physicalImageDescriptor({resourceKind:'artwork',resourceId:media.id},{width:media.width,height:media.height,mimeType:'image/webp'},media.id+'.ref');
 return descriptor?buildImageAttributes(descriptor,'(max-width:767px) 100vw, 900px'):{src:'/media/'+media.id,srcSet:undefined,sizes:undefined};
}
