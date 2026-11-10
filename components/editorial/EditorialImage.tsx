'use client';
/* eslint-disable @next/next/no-img-element -- Native SSR src/srcset uses the public Storage/CDN renditions. */
import {useEffect,useRef,type ImgHTMLAttributes} from 'react';
import type {components} from '../../lib/api/generated';
import {useMediaDisplayContext} from '../../lib/media/MediaDisplayProvider';
import {useSiteContent} from '../SiteContentProvider';
import {buildImageAttributes} from '../../lib/media/public-image-url';
import {editorialImageDescriptor} from '../../lib/editorial/image';
interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'onError'>{src:string;image?:components['schemas']['EditorialImageMetadata'];fill?:boolean;priority?:boolean;forceReference?:boolean;onError?:()=>void}
/** A regular image: one declaration, native loading, and no hydration-time source swap. */
export function EditorialImage({src,image,fill,priority,forceReference,onError,alt='',...props}:Props){
 const context=useMediaDisplayContext(),site=useSiteContent(),node=useRef<HTMLImageElement>(null),checked=useRef<string|null>(null),descriptor=context?.responsive&&site.scope==='public'?editorialImageDescriptor(src,image):undefined;
 const attributes=descriptor?buildImageAttributes(descriptor,props.sizes??'100vw'):{src,srcSet:props.srcSet,sizes:props.sizes};
 // Cached images may have completed before the reader's zoom controls hydrated.
 useEffect(()=>{const image=node.current;if(image?.complete&&checked.current!==attributes.src){checked.current=attributes.src;if(image.naturalWidth)image.dispatchEvent(new Event('load',{bubbles:true}));else onError?.();}},[attributes.src,attributes.srcSet,onError]);
 return <img {...props} ref={node} alt={alt} data-public-image-path={src} data-editorial-image src={attributes.src} srcSet={forceReference?undefined:attributes.srcSet} sizes={forceReference?undefined:attributes.sizes} width={fill?undefined:props.width??image?.width} height={fill?undefined:props.height??image?.height} loading={priority?'eager':props.loading??'lazy'} decoding={props.decoding??'async'} fetchPriority={props.fetchPriority??(priority?'high':undefined)} onError={onError} style={{color:'transparent',...(fill?{position:'absolute',inset:0,width:'100%',height:'100%'} as const:{}),...props.style}}/>;
}
