"use client";
import {useRef,useState} from "react";
import {useArtworkView} from "../artworks/ArtworkViewProvider";
import {RattonArtworkVisitBoundary} from "../artworks/ratton/RattonArtworkVisitBoundary";
import {ArtworkOpeningBoundary,useArtworkOpening} from "../artworks/ArtworkOpeningBoundary";
import {ArtworkNavigationContext} from "../artworks/ArtworkNavigationContext";
import {ArtworkDialogShell} from "../artworks/ArtworkDialogShell";
import {PageRenderer,type PageRendererProps} from "../../page-composer/PageRenderer";
import type {ArtworkContent} from "../artworks/ArtworkInformation";
import {Button} from "../ui/Button";
/** Preview authority stays in the server session; controls never choose another work or locale. */
function PreviewContent({presentation,content,siteName,demonstration}:{presentation:PageRendererProps["presentation"];content:ArtworkContent;siteName:string;demonstration:boolean}){
 const opening=useArtworkOpening();const container=useRef<HTMLDivElement>(null),[open,setOpen]=useState(true);
 return <ArtworkNavigationContext value={{container,close:()=>setOpen(false),changeLocale:()=>{}}}><div ref={container}>
  {open?<PreviewVisit content={content}><ArtworkDialogShell locale={content.locale}><PageRenderer presentation={presentation} siteName={siteName} demonstration={demonstration} contactMode="inert" data={{artwork:content.artwork,artworkContent:content}}/></ArtworkDialogShell></PreviewVisit>:<Button onClick={()=>{opening?.begin();setOpen(true);}}>Rouvrir l’œuvre</Button>}
 </div></ArtworkNavigationContext>;
}

export function ArtworkPreviewDocument(props:Parameters<typeof PreviewContent>[0]){return <ArtworkOpeningBoundary><PreviewContent {...props}/></ArtworkOpeningBoundary>;}

function PreviewVisit({content,children}:{content:ArtworkContent;children:React.ReactNode}){return useArtworkView()==="lucas-ratton"?<RattonArtworkVisitBoundary artworkId={content.artwork.id} mediaIds={content.artwork.media.map(m=>m.id)}>{children}</RattonArtworkVisitBoundary>:children;}
