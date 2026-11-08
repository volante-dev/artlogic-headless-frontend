"use client";
import {selectPresentation} from "../lib/presentation/select-presentation";
import {contactFormReference} from "../lib/forms/contact-compatibility.generated";
import {FormOwnerProvider} from "../lib/forms/execution";
import {ArtworkDocumentRenderer} from "./ArtworkDocumentRenderer";
import {ContactExecutionProvider} from "../lib/contact/execution";
import {ContactForm} from "../components/contact/ContactForm";
import {ContactArtworkSection} from "../components/contact/ContactArtworkSection";
import type {ContactConfiguration,ContactExecutionMode} from "../lib/contact/types";
import {createElement} from "react";
import type {ComponentType} from "react";
import type {PublicPresentation,PresentationSection} from "../lib/presentation/types";
import type {SectionContext,PageData} from "../sections/types";
import {useSiteContent} from "../components/SiteContentProvider";
import {Typography} from "../components/ui/Typography";
import {sectionRegistry,assertRenderableSection} from "./registry";
import {manifestFingerprints} from "../clients/manifests/fingerprints.generated";
import {HeroMedia} from "../sections/HeroMedia";
import {ClientComponentsProvider} from "../clients/ClientComponentsProvider";
import styles from "../sections/Sections.module.css";
import {useSiteLocale} from "../components/SiteLocaleBoundary";
export interface PageRendererProps {presentation:Omit<PublicPresentation,"releaseId">;siteName:string;demonstration?:boolean;data?:PageData;contactMode?:ContactExecutionMode;contactConfiguration?:ContactConfiguration|null;includeContactForm?:boolean;applyTranslation?:boolean;includePageTitle?:boolean;formArtworkId?:string;contactStrategy?:"legacy"|"forms"}
export function PageRenderer({presentation,siteName,demonstration=false,data,contactMode="live",contactConfiguration=null,includeContactForm=true,applyTranslation=true,includePageTitle=true,formArtworkId,contactStrategy}:PageRendererProps){
  const translated=useSiteLocale()?.translation?.presentation;
  if(applyTranslation)presentation=selectPresentation(presentation,translated);
  if(presentation.pageKey==="contact"&&contactStrategy==="legacy")presentation={...presentation,sections:presentation.sections.filter(section=>section.type!=="form"&&section.type!=="formImage")};
  return <FormOwnerProvider owner={presentation.pageKey==="artworkDetail"&&data?.artwork?{ownerType:"artwork",ownerId:data.artwork.id}:{ownerType:"page",ownerId:presentation.pageKey,...(presentation.pageKey==="contact"&&formArtworkId?{artworkId:formArtworkId}:{})}}><ContactExecutionProvider mode={contactMode}><ClientComponentsProvider profileId={presentation.profileId}>{presentation.pageKey==="artworkDetail"&&data?.artworkContent?<ArtworkDocumentRenderer presentation={presentation} content={data.artworkContent} siteName={siteName} demonstration={demonstration}/>:<PageContents presentation={presentation} siteName={siteName} demonstration={demonstration} data={data} contactMode={contactMode} contactConfiguration={contactConfiguration} includeContactForm={includeContactForm} includePageTitle={includePageTitle} contactStrategy={contactStrategy}/>}</ClientComponentsProvider></ContactExecutionProvider></FormOwnerProvider>;
}
function PageContents({presentation,siteName,demonstration=false,data,contactMode="live",contactConfiguration=null,includeContactForm=true,includePageTitle=true,contactStrategy}:PageRendererProps){
  const {messages}=useSiteContent(),{pageKey,sections}=presentation;
  let contactReference:ReturnType<typeof contactFormReference>|undefined;
  if(pageKey==="contact"&&contactStrategy==="forms")try{contactReference=contactFormReference(sections);}catch{return <section className={styles.section}><p role="alert">{messages["contact.disabled"]}</p></section>;}
  if(presentation.schemaVersion!==1||presentation.manifestFingerprint!==manifestFingerprints[presentation.profileId as keyof typeof manifestFingerprints])throw new Error("unsupported_presentation_profile");
  for(const section of sections)assertRenderableSection(section);
  if(!sections.length&&pageKey==="home")return <HeroMedia section={{id:"home-fallback",type:"heroMedia",schemaVersion:1,variant:"immersive",props:{heading:siteName}}} siteName={siteName}/>;
  const business=!includePageTitle||pageKey==="artworks"||pageKey==="artworkDetail"||pageKey==="galerist",firstTitle=sections.find(s=>s.type==="heroMedia"||("heading" in s.props&&Boolean(s.props.heading)));
  return <>{pageKey==="galerist"&&includePageTitle&&<div className={styles.section}><Typography variant="h1">{presentation.pageIdentity?.name||"Le galeriste"}</Typography></div>}{!business&&!firstTitle&&!(pageKey==="contact"&&includeContactForm&&sections.length===0)&&<div className={styles.section}><Typography variant="h1">{messages[`page.${pageKey as "home"|"news"|"artworks"|"exhibitions"|"publications"|"expertise"|"contact"}.title`]}</Typography>{!sections.length&&pageKey!=="home"&&<Typography>{messages[`page.${pageKey as "news"|"exhibitions"|"publications"|"expertise"|"contact"}.empty`]}</Typography>}</div>}
    {sections.map((section,index)=>{
      if(data?.contactArtwork&&section.id===contactReference?.blockId&&(section.type==="form"||section.type==="formImage"))return <ContactArtworkSection key={section.id} section={section} artwork={data.contactArtwork}/>;
      // Correlation was checked above; the mapped registry gives each view its exact union member.
      const View=sectionRegistry[section.type] as ComponentType<{section:PresentationSection}&SectionContext>;
      return createElement(View,{key:section.id,section,headingLevel:!business&&section.id===firstTitle?.id?"h1":"h2",siteName,demonstration,data,exploreTarget:sections[index+1]?.id});
    })}
    {includeContactForm&&pageKey==="contact"&&<ContactForm configuration={contactConfiguration} mode={contactMode} headingLevel={sections.length?"h2":"h1"}/>}
  </>;
}
