"use client";
import {useContext,useId} from "react";
import {ArtworkHeadingContext} from "./ArtworkHeadingContext";
import type {ArtworkContent} from "./ArtworkInformation";
import {useSiteContent} from "../SiteContentProvider";
export function ArtworkIdentity({content,className}:{content:ArtworkContent;className?:string}){
 const generated=useId(),heading=useContext(ArtworkHeadingContext)??generated,{messages}=useSiteContent();
 return <div className={className}><h1 id={heading} tabIndex={-1} data-artwork-title data-artwork-focus-heading data-mobile-mode-heading>{content.artwork.title??messages["artwork.untitled"]}</h1>{content.artwork.artist&&<p data-artwork-artist>{content.artwork.artist}</p>}</div>;
}
