"use client";
import type {GalleryExperience} from "../../lib/artworks/types";
import {useSiteContent} from "../SiteContentProvider";
import {Typography} from "../ui/Typography";
import {FreshLink} from "../FreshLink";
import {localizedPath} from "../../lib/i18n/routes";
import {useContactExecutionMode} from "../../lib/contact/execution";
export type ArtworkContent=Pick<GalleryExperience,"artwork"|"locale"|"description"|"descriptionLocale">;
export interface ArtworkInformationProps {content:ArtworkContent;headingId?:string;className?:string;headingComponent?:"h1"|"p";showIdentity?:boolean}
export function ArtworkInquiryLink({id,locale}:{id:string;locale:string}){
  const {messages,defaultLocale,scope}=useSiteContent(),mode=useContactExecutionMode("live"),inert=mode==="inert"||scope==="preview";
  return <FreshLink href={localizedPath("/contact",locale,defaultLocale)+"?artwork="+id} aria-disabled={inert||undefined} onClick={event=>{if(inert)event.preventDefault();}}>{messages["contact.artworkCta"]}</FreshLink>;
}
export function ArtworkInformation({content,headingId,className,headingComponent="h1",showIdentity=true}:ArtworkInformationProps){
  const {messages:m}=useSiteContent(),{artwork:art,description}=content;
  const details=[[m["artwork.year"],art.year],[m["artwork.medium"],art.medium],[m["artwork.dimensions"],art.dimensions]].filter((row):row is [string,string]=>row[1]!==null);
  return <div className={className}>
    {showIdentity&&<Typography variant="h1" component={headingComponent} id={headingId} data-artwork-title>{art.title??m["artwork.untitled"]}</Typography>}
    {showIdentity&&art.artist&&<Typography data-artwork-artist>{art.artist}</Typography>}
    {description&&<Typography component="div" lang={content.descriptionLocale??content.locale} style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",maxWidth:"70ch"}}>{description}</Typography>}
    {details.length>0&&<dl>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    <ArtworkInquiryLink id={art.id} locale={content.locale}/>
  </div>;
}
