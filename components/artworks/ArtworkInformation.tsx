"use client";
import {ArtworkFinaleDetails} from "./ArtworkFinaleDetails";
import {artworkConclusion} from "./ArtworkDocumentContent";
import type {GalleryExperience} from "../../lib/artworks/types";
import {useSiteContent} from "../SiteContentProvider";
import {Typography} from "../ui/Typography";
import {FreshLink} from "../FreshLink";
import {localizedPath} from "../../lib/i18n/routes";
import {useContactExecutionMode} from "../../lib/contact/execution";
export type ArtworkContent=Pick<GalleryExperience,"artwork"|"locale"|"description"|"descriptionLocale"|"heroFocus"|"importedDescription"|"importedDescriptionLocale"|"importedProvenance"|"importedProvenanceLocale">;
export interface ArtworkInformationProps {content:ArtworkContent;headingId?:string;className?:string;headingComponent?:"h1"|"p";showIdentity?:boolean;showContact?:boolean;finaleActive?:boolean}
export function ArtworkInquiryLink({id,locale}:{id:string;locale:string}){
  const {messages,defaultLocale,scope}=useSiteContent(),mode=useContactExecutionMode("live"),inert=mode==="inert"||scope==="preview";
  return <FreshLink href={localizedPath("/contact",locale,defaultLocale)+"?artwork="+id} aria-disabled={inert||undefined} onClick={event=>{if(inert)event.preventDefault();}}>{messages["contact.artworkCta"]}</FreshLink>;
}
export function ArtworkInformation({content,headingId,className,headingComponent="h1",showIdentity=true,showContact=true,finaleActive}:ArtworkInformationProps){
  const {messages:m}=useSiteContent(),{artwork:art,description}=content;
  const conclusion=artworkConclusion(content);
  const details=[[m["artwork.year"],art.year],[m["artwork.medium"],art.medium],[m["artwork.dimensions"],art.dimensions]].filter((row):row is [string,string]=>row[1]!==null);
  return <div className={className} data-artwork-information>
    <div data-artwork-information-identity>
    {showIdentity&&<Typography variant="h1" component={headingComponent} id={headingId} data-artwork-title>{art.title??m["artwork.untitled"]}</Typography>}
    {showIdentity&&art.artist&&<Typography data-artwork-artist>{art.artist}</Typography>}
    {description&&<Typography component="div" lang={content.descriptionLocale??content.locale} style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",maxWidth:"70ch"}}>{description}</Typography>}
    {details.length>0&&<dl>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    </div><div data-artwork-finale-slot>{finaleActive!==undefined&&<ArtworkFinaleDetails persistent active={finaleActive} provenanceLabel="Provenance" provenance={conclusion.provenance}>{conclusion.description}</ArtworkFinaleDetails>}</div>{showContact&&<div data-artwork-information-contact><ArtworkInquiryLink id={art.id} locale={content.locale}/></div>}
  </div>;
}
