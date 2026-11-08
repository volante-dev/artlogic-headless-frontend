"use client";
import {LoadingIndicator} from "../SiteLoading";
import{useEditorialSurface}from"./immersive/EditorialInteractionProvider";
import {PublicAssetImage as Image} from "@/components/PublicAssetImage";
import {useId,useState,useEffect,useRef,type CSSProperties} from "react";
import Dialog from "@mui/material/Dialog";
import {IconButton} from "../ui/IconButton";
import type {components} from "../../lib/api/generated";
import {safeEditorialHref} from "../../lib/editorial/links";
import {useEditorialExecution} from "../../lib/editorial/execution";
import {useSiteContent} from "../SiteContentProvider";
import {FreshLink} from "../FreshLink";
import {ArtworkLink} from "../artworks/ArtworkLink";
import {RichText} from "./RichText";
import {NativePlayer} from "./media/NativePlayer";
import {YouTubePlayer} from "./media/YouTubePlayer";
import {VimeoPlayer} from "./media/VimeoPlayer";
import styles from "./EditorialBlocks.module.css";
export type PublicEditorialMedia=components["schemas"]["EditorialPublicMedia"];
const ratios={natural:"auto",square:"1",landscape:"4 / 3",portrait:"3 / 4",fullscreen:"auto"};
function mediaVariables(media:PublicEditorialMedia):CSSProperties{
 const variables:Record<string,string>={};
 for(const device of ["desktop","mobile"] as const){const render=media.render[device];variables["--media-ratio-"+device]=ratios[render.aspect];variables["--media-height-"+device]=render.aspect==="fullscreen"?"100svh":"auto";variables["--media-position-"+device]=render.aspect==="natural"?"relative":"absolute";variables["--media-image-height-"+device]=render.aspect==="natural"?"auto":"100%";variables["--media-fit-"+device]=render.fit;variables["--media-focus-"+device]=`${render.focalPoint.x*100}% ${render.focalPoint.y*100}%`;variables["--media-zoom-"+device]=render.enlarge?"inline-flex":"none";}
 return variables as CSSProperties;
}
export function MediaBlock({media,active=true,autoplay,timeoutMs,preparing=false,allowZoom=true,captionFocusable=false,appearanceFrame=false}:{media:PublicEditorialMedia;active?:boolean;autoplay?:boolean;timeoutMs?:number;preparing?:boolean;allowZoom?:boolean;captionFocusable?:boolean;appearanceFrame?:boolean}){
 const {messages:m}=useSiteContent(),mode=useEditorialExecution(),[zoom,setZoom]=useState(false),[loaded,setLoaded]=useState<string|null>(null),[failed,setFailed]=useState<string|null>(null),[attempt,setAttempt]=useState(0),pendingSince=useRef<{src:string;at:number}|null>(null),labelId=useId();
 useEditorialSurface(allowZoom&&zoom);
 const source=media.source,photo=source?.kind==="image"||source?.kind==="artwork"?source:null,video=media.video;
 useEffect(()=>{if(!active&&!preparing){pendingSince.current=null;return;}if(!timeoutMs||!photo||loaded===photo.srcPath||failed===photo.srcPath)return;if(pendingSince.current?.src!==photo.srcPath)pendingSince.current={src:photo.srcPath,at:Date.now()};const timer=setTimeout(()=>setFailed(photo.srcPath),Math.max(0,timeoutMs-(Date.now()-pendingSince.current.at)));return()=>clearTimeout(timer);},[timeoutMs,photo,loaded,failed,attempt,active,preparing]);
 const inert=mode==="inert",unavailable=photo&&failed===photo.srcPath;
 const image=photo?<Image key={photo.srcPath+":"+attempt} unoptimized src={photo.srcPath} alt={media.alt} width={photo.width??1600} height={photo.height??1200} className={styles.image} data-ready={loaded===photo.srcPath} onLoad={()=>setLoaded(photo.srcPath)} onError={()=>setFailed(photo.srcPath)}/>:null;
 const cta=source&&media.cta&&safeEditorialHref(media.cta.href)?media.cta:null;
 return <figure className={styles.media} style={mediaVariables(media)}>
 {photo&&<div data-editorial-media-viewport data-group-motion-frame={appearanceFrame||undefined} className={styles.viewport}>{unavailable?<div role="alert" className={styles.visualError}>{m["editorial.imageUnavailable"]}{timeoutMs&&<button type="button" onClick={()=>{pendingSince.current=null;setFailed(null);setLoaded(null);setAttempt(a=>a+1);}}>{m["editorial.retry"]}</button>}</div>:<>{photo.kind==="artwork"?<ArtworkLink href={photo.href} onClick={event=>{if(inert)event.preventDefault();}} aria-disabled={inert||undefined}>{image}</ArtworkLink>:image}{loaded!==photo.srcPath&&<span className={styles.loader} aria-hidden="true"><LoadingIndicator decorative/></span>}{photo.kind==="image"&&allowZoom&&<IconButton surface="light" className={styles.zoom} aria-label={m["editorial.zoomImage"]} disabled={loaded!==photo.srcPath} onClick={()=>setZoom(true)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/></svg></IconButton>}</>}</div>}
 {source?.kind==="video"&&<NativePlayer key={source.srcPath} src={source.srcPath} poster={video?.posterPath} label={media.alt} active={active} autoplay={autoplay??video?.autoplay??false} showSoundControl={video?.showSoundControl??true}/>}
 {(source?.kind==="youtube"||source?.kind==="vimeo")&&<div data-editorial-media-viewport className={styles.externalFrame}>{source.kind==="youtube"?<YouTubePlayer key={source.videoId} videoId={source.videoId} label={media.alt} active={active} autoplay={autoplay??video?.autoplay??false} showSoundControl={video?.showSoundControl??true}/>:<VimeoPlayer key={source.videoId+source.privacyHash} videoId={source.videoId} privacyHash={source.privacyHash} label={media.alt} active={active} autoplay={autoplay??video?.autoplay??false} showSoundControl={video?.showSoundControl??true}/>}</div>}
 {(media.subtext||media.artworkInfo.length>0||cta)&&<figcaption tabIndex={captionFocusable?0:undefined} onKeyDownCapture={event=>{if(!captionFocusable||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey)return;const details=event.currentTarget.querySelector<HTMLElement>('[data-editorial-caption-details]'),element=details&&details.scrollHeight>details.clientHeight+2?details:event.currentTarget,max=element.scrollHeight-element.clientHeight;if(max<=2)return;const direction=event.key==="ArrowDown"||event.key==="PageDown"?1:event.key==="ArrowUp"||event.key==="PageUp"?-1:0;const next=event.key==="Home"?0:event.key==="End"?max:direction?Math.max(0,Math.min(max,element.scrollTop+direction*(event.key.startsWith("Page")?element.clientHeight*.85:40))):element.scrollTop;if(next===element.scrollTop)return;event.preventDefault();element.scrollTop=next;}} data-editorial-scroll-host className={styles.caption} data-editorial-motion-controls><div className={styles.captionDetails} data-editorial-caption-details data-editorial-scroll-host>{media.artworkInfo.length>0&&<dl className={styles.artworkInfo}>{media.artworkInfo.map(info=><div key={info.field}><dt>{info.label}</dt><dd>{info.value}</dd></div>)}</dl>}{media.subtext&&<RichText document={media.subtext}/>}</div> {cta&&(source?.kind==="artwork"?<ArtworkLink className={styles.cta} href={cta.href} onClick={event=>{if(inert)event.preventDefault();}} aria-disabled={inert||undefined}>{cta.label}<span aria-hidden="true">↗</span></ArtworkLink>:<FreshLink className={styles.cta} href={cta.href} {...(cta.href.startsWith("https:")?{target:"_blank",rel:"noopener noreferrer"}:{})}>{cta.label}<span aria-hidden="true">↗</span></FreshLink>)}</figcaption>}
 {photo?.kind==="image"&&allowZoom&&<Dialog fullScreen open={zoom} onClose={()=>setZoom(false)} aria-labelledby={labelId} slotProps={{paper:{className:styles.zoomDialog}}}><h2 id={labelId} className={styles.srOnly}>{m["editorial.imageDialog"]}</h2><IconButton surface="light" className={styles.zoomClose} aria-label={m["editorial.close"]} onClick={()=>setZoom(false)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></IconButton><Image forceReference sizes="100vw" unoptimized src={photo.srcPath} alt={media.alt} width={photo.width??1600} height={photo.height??1200} style={{width:"100%",height:"100%",objectFit:"contain"}}/></Dialog>}
 </figure>;
}
