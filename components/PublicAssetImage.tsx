'use client';
import Image from 'next/image';
import type{ImgHTMLAttributes}from'react';
import{useSiteContent}from'./SiteContentProvider';
import{useMediaDisplayContext}from'../lib/media/MediaDisplayProvider';
import{ResponsivePublicImage}from'./ResponsivePublicImage';
import {publicImageResource,type ImageDescriptor}from'../lib/media/public-image-url';
interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'onError'|'resource'>{src:string;fill?:boolean;unoptimized?:boolean;priority?:boolean;descriptor?:ImageDescriptor;forceReference?:boolean;onError?:()=>void}
export function PublicAssetImage({src,fill,unoptimized,priority,descriptor,forceReference,onError,...props}:Props){
 const context=useMediaDisplayContext(),site=useSiteContent(),resource=publicImageResource(src);
 if(!context?.responsive||site.scope!=='public'||!resource)return <Image {...props} unoptimized={unoptimized??true} src={src} fill={fill} priority={priority} width={fill?undefined:typeof props.width==='string'?Number(props.width):props.width} height={fill?undefined:typeof props.height==='string'?Number(props.height):props.height} onError={onError} alt={props.alt??''}/>;
 return <ResponsivePublicImage {...props} resource={resource} descriptor={descriptor??context.descriptors.peek?.(resource)} fallbackPath={src} sizes={props.sizes??'100vw'} eager={priority||props.loading==='eager'} forceReference={forceReference} onTerminalFailure={onError} style={{...(fill?{position:'absolute',inset:0,width:'100%',height:'100%'} as const:{}),...props.style}}/>;
}
