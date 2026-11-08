"use client";
import {detailImageSizes} from "@/lib/media/public-image-sizes";
import {useId,useCallback,useContext,useRef,useState,useLayoutEffect,type ComponentType, type ReactNode} from "react";
import {useSiteContent} from "../SiteContentProvider";
import {ArtworkImage} from "../ArtworkImage";
import {Typography} from "../ui/Typography";
import {ArtworkInformation,type ArtworkContent,type ArtworkInformationProps} from "./ArtworkInformation";
import {ArtworkProgress,type ArtworkProgressProps} from "./ArtworkProgress";
import {useArtworkEntrance} from "./useArtworkEntrance";
import {ArtworkFinaleScene} from "./ArtworkFinaleScene";
import {useArtworkScroll} from "./useArtworkScroll";
import {ArtworkHeadingContext} from "./ArtworkHeadingContext";
import {useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {ArtworkZoomImage} from "./ArtworkZoomImage";
import styles from "./ArtworkExperience.module.css";
export interface ArtworkExperienceProps {
  id?:string;
  content:ArtworkContent;
  InformationView?:ComponentType<ArtworkInformationProps>;
  ProgressView?:ComponentType<ArtworkProgressProps>;
  supplementalContent?:ReactNode;
}
/** Replaceable composition; the public reader, modal and navigation stay outside this view. */
export function DesktopArtworkExperience({content,id,InformationView=ArtworkInformation,ProgressView=ArtworkProgress,supplementalContent}:ArtworkExperienceProps){
  const instance=useId(),heading=useContext(ArtworkHeadingContext)??instance,{messages:m}=useSiteContent();
  const {artwork:art,description}=content,count=art.media.length,store=useArtworkInteraction();
  const [finale,setFinale]=useState<{anchor:string|null;open:boolean}|null>(null),pendingFinaleSelection=useRef<number|null>(null),selected=useRef(0);
 const changeFinale=useCallback((open:boolean)=>{store?.send({type:open?"finale":"gallery"},art.media.map(m=>m.id));setFinale(prior=>open?{anchor:art.media[selected.current]?.id??null,open:true}:prior?{...prior,open:false}:null);},[art.media,store]);
 const {root,information,active,goTo,restoreTo,enhanced}=useArtworkScroll(count,{active:finale!==null,change:changeFinale});useLayoutEffect(()=>{selected.current=active;},[active]);useArtworkEntrance(root);
  const [selection,setSelection]=useState({from:active,to:active}),restoring=useRef<number|null>(null);
  if(selection.to!==active)setSelection({from:selection.to,to:active});
  const previous=selection.to===active?selection.from:selection.to;
  useLayoutEffect(()=>{const index=art.media.findIndex(m=>m.id===store?.read().selectedMediaId);restoring.current=Math.max(0,index);restoreTo(Math.max(0,index));if(store?.read().mode==="finale"){selected.current=Math.max(0,index);changeFinale(true);}},[store,restoreTo,art.media,changeFinale]);
  useLayoutEffect(()=>{if(restoring.current!==null){if(active!==restoring.current)return;restoring.current=null;}const media=art.media[active];if(store&&media&&store.read().selectedMediaId!==media.id){store.send({type:"select",id:media.id,now:performance.now()},art.media.map(m=>m.id));store.send({type:"commit",epoch:store.read().epoch},art.media.map(m=>m.id));}},[active,art.media,store]);
  const introduction=description&&Array.from(description).length>240?Array.from(description).slice(0,237).join("")+"…":description;
  return <article id={id} ref={root} className={styles.experience} data-artwork-experience data-testid="artwork-experience" data-enhanced={String(enhanced)} data-artwork-layout="desktop" aria-labelledby={heading}>
    <h1 id={heading} tabIndex={-1} data-artwork-focus-heading className={styles.srOnly}>{art.title??m["artwork.untitled"]}</h1>
    <div className={styles.stage}>
      <div className={styles.frame} data-artwork-entry-media data-testid="artwork-frame">
        <div className={styles.imageStack} data-artwork-image-stack>
          {count?art.media.map((media,index)=><div key={media.id} className={styles.view} data-view={index} data-finale-photo={media.id} data-active={index===active} inert={(enhanced?index!==active:index!==0)||undefined} aria-hidden={enhanced?index!==active:index!==0}>
            <ArtworkZoomImage media={media} title={art.title} active={index===active} eager={index===0||index===active} controlSurface={index===0?"image":"light"} transitioning heroFocus={index===0?content.heroFocus:null} introDrift={index===0} zoomOut={previous>=1&&active>=1}/>
          </div>):<div className={styles.view} data-view="0" data-active="true"><ArtworkImage title={art.title}/></div>}
        </div>
      </div>
      <div className={styles.frost} data-artwork-frost aria-hidden="true">
        <div className={styles.frostSurface} data-artwork-frost-surface/>
        <div className={styles.frostContent} data-artwork-frost-content>
        <Typography variant="h1" component="p">{art.title??m["artwork.untitled"]}</Typography>
        {art.artist&&<Typography>{art.artist}</Typography>}
        {introduction&&<Typography className={styles.introduction} lang={content.descriptionLocale??content.locale}>{introduction}</Typography>}
        </div>
      </div>
    </div>
    <div className={styles.readingFlow}>
      <div ref={information} className={styles.information}>
        <InformationView content={content} headingComponent="p"/>
      </div>
    </div>
    <div className={styles.staticViews}>
      {art.media.slice(1).map((media,index)=><figure key={media.id} data-static-view={index+1}>
        <ArtworkZoomImage media={media} title={art.title}/>
      </figure>)}
    </div>
    <ProgressView finale count={Math.max(1,count)+1} active={finale?.open?Math.max(1,count):active} onSelect={index=>{if(index===Math.max(1,count)){changeFinale(true);return;}if(finale){pendingFinaleSelection.current=index;changeFinale(false);}else goTo(index);}}/>
    {finale&&<ArtworkFinaleScene owner={root} content={content} anchor={finale.anchor} open={finale.open} mobile={false} onExited={()=>{setFinale(null);if(pendingFinaleSelection.current!==null){goTo(pendingFinaleSelection.current);pendingFinaleSelection.current=null;}}}/>}
    <span className={styles.srOnly} role="status">{finale?.open?"Conclusion":""}</span>
    {supplementalContent}
  </article>;
}
