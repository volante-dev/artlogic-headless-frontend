"use client";
import {useRef,useState} from "react";
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
  {open?<ArtworkDialogShell locale={content.locale}><PageRenderer presentation={presentation} siteName={siteName} demonstration={demonstration} contactMode="inert" data={{artwork:content.artwork,artworkContent:content}}/></ArtworkDialogShell>:<Button onClick={()=>{opening?.begin();setOpen(true);}}>Rouvrir l’œuvre</Button>}
 </div></ArtworkNavigationContext>;
}

export function ArtworkPreviewDocument(props:Parameters<typeof PreviewContent>[0]){return <ArtworkOpeningBoundary><PreviewContent {...props}/></ArtworkOpeningBoundary>;}
