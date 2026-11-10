"use client";
import {ArtworkInitialDocument} from "./ArtworkInitialDocument";
import {useLayoutEffect,useRef,type ComponentType,type ReactNode} from "react";
import type {ArtworkContent,ArtworkInformationProps} from "./ArtworkInformation";
import {ArtworkInformation} from "./ArtworkInformation";
import {ArtworkProgress,type ArtworkProgressProps} from "./ArtworkProgress";
import {DesktopArtworkExperience} from "./DesktopArtworkExperience";
import {MobileArtworkExperience} from "./MobileArtworkExperience";
import {ArtworkMobileController,type MobileArtworkViewProps} from "./ArtworkMobileController";
import {useArtworkViewport} from "./useArtworkViewport";
import {ArtworkInteractionBoundary,useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {ArtworkOpeningBoundary,useArtworkOpening} from "./ArtworkOpeningBoundary";
import {useSiteContent} from "../SiteContentProvider";
export interface ArtworkExperienceProps {id?:string;content:ArtworkContent;InformationView?:ComponentType<ArtworkInformationProps>;ProgressView?:ComponentType<ArtworkProgressProps>;MobileView?:ComponentType<MobileArtworkViewProps>;supplementalContent?:ReactNode}
export function ArtworkExperience(props:ArtworkExperienceProps){
 const opening=useArtworkOpening(),store=useArtworkInteraction(),site=useSiteContent();
 if(!opening)return <ArtworkOpeningBoundary><ArtworkExperience {...props}/></ArtworkOpeningBoundary>;
 if(!store)return <ArtworkInteractionBoundary artworkId={props.content.artwork.id} mediaIds={props.content.artwork.media.map(m=>m.id)} scope={site.scope==="preview"?"preview":"public"}><ArtworkExperience {...props}/></ArtworkInteractionBoundary>;
 return <ResponsiveExperience {...props}/>;
}
function ResponsiveExperience({MobileView=MobileArtworkExperience,InformationView=ArtworkInformation,ProgressView=ArtworkProgress,...props}:ArtworkExperienceProps){
 const layout=useArtworkViewport(),previous=useRef(layout),store=useArtworkInteraction()!,opening=useArtworkOpening();
 useLayoutEffect(()=>{const old=previous.current;previous.current=layout;if(layout!=="pending"&&old!=="pending"&&old!==layout){opening?.finish();store.send({type:"composition"},props.content.artwork.media.map(m=>m.id));if(document.activeElement===document.body||document.activeElement instanceof HTMLElement&&(!document.activeElement.isConnected||document.activeElement.closest("[inert]"))){const heading=document.querySelector<HTMLElement>("[data-artwork-focus-heading]"),waiting=heading?.closest<HTMLElement>('[data-artwork-media-ready="false"]');if(waiting)waiting.setAttribute("data-artwork-restore-focus","");else heading?.focus({preventScroll:true});}}},[layout,opening,store,props.content.artwork.media]);
 if(layout==="pending")return <ArtworkInitialDocument content={props.content}/>;
 if(layout==="desktop")return <DesktopArtworkExperience {...props} InformationView={InformationView} ProgressView={ProgressView}/>;
 return <ArtworkMobileController id={props.id} content={props.content} InformationView={InformationView} ProgressView={ProgressView} supplementalContent={props.supplementalContent} View={MobileView}/>;
}
