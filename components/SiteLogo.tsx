'use client';
import {useState} from 'react';
import {useMediaDisplay} from '@/lib/media/useMediaDisplay';
import Image from 'next/image';
import type {SiteContent} from '@/lib/api/site-content';
import {useMediaDisplayContext} from '@/lib/media/MediaDisplayProvider';
import {physicalImageDescriptor} from '@/lib/media/public-image-descriptor';
import {ResponsivePublicImage} from './ResponsivePublicImage';
import {useSiteContent} from './SiteContentProvider';
type Props={logo:SiteContent['logo'];siteName:string};
function LegacySiteLogo({logo,siteName}:Props){const {image:imageRef,src,failed,onLoad}=useMediaDisplay(logo?'/site-logos/'+logo.id:undefined,'siteLogo',logo?.id);if(!logo||failed)return <span>{siteName}</span>;return <Image unoptimized data-testid='site-logo' ref={imageRef} src={src} onLoad={onLoad} width={logo.width} height={logo.height} alt='' loading='eager' style={{maxWidth:200,maxHeight:72,width:'auto',height:'auto',objectFit:'contain'}}/>;}
export function SiteLogo(props:Props){const context=useMediaDisplayContext(),site=useSiteContent(),logo=props.logo;if(!logo||!context?.responsive||site.scope!=='public')return <LegacySiteLogo {...props}/>;
 return <ResponsiveSiteLogo {...props}/>;}
function ResponsiveSiteLogo({logo,siteName}:Props){const [failedId,setFailedId]=useState<string|null>(null);if(!logo||failedId===logo.id)return <span>{siteName}</span>;
 const resource={resourceKind:'siteLogo' as const,resourceId:logo.id};return <ResponsivePublicImage resource={resource} descriptor={physicalImageDescriptor(resource,{width:logo.width,height:logo.height,mimeType:'image/webp'},logo.id+'.ref')} sizes={Math.min(logo.width,200,72*logo.width/logo.height)+'px'} width={logo.width} height={logo.height} alt='' eager onTerminalFailure={()=>setFailedId(logo.id)} data-testid='site-logo' style={{maxWidth:200,maxHeight:72,width:'auto',height:'auto',objectFit:'contain'}}/>;}
