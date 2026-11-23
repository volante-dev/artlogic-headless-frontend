"use client";
import {useContactExecutionMode} from "../lib/contact/execution";
import {ClientComponentsProvider,useClientComponents} from "../clients/ClientComponentsProvider";
import {PageRenderer} from "./PageRenderer";
import {assertRenderableSection} from "./registry";
import type {PublicPresentation} from "../lib/presentation/types";
import type {ArtworkContent} from "../components/artworks/ArtworkInformation";
export interface ArtworkDocumentRendererProps {presentation:Omit<PublicPresentation,"releaseId">&{releaseId?:string};content:ArtworkContent;siteName:string;demonstration?:boolean}
/** The required artwork scene always leads; additional sections keep their relative order. */
export function ArtworkDocumentRenderer({presentation,content,siteName,demonstration}:ArtworkDocumentRendererProps){
  return <ClientComponentsProvider profileId={presentation.profileId}><ArtworkContents presentation={presentation} content={content} siteName={siteName} demonstration={demonstration}/></ClientComponentsProvider>;
}
function ArtworkContents({presentation,content,siteName,demonstration}:ArtworkDocumentRendererProps){
  const contactMode=useContactExecutionMode("live");
  const {ArtworkExperience,ArtworkInformation,ArtworkProgress}=useClientComponents();
  for(const section of presentation.sections)assertRenderableSection(section);
  const required=presentation.sections.filter(section=>section.type==="artworkDetails");
  if(required.length!==1)throw new Error("artwork_scene_required");
  const sections=presentation.sections.filter(section=>section.type!=="artworkDetails");
  const extension=presentation.teamExtension;const teamExtension=extension?{...extension,section:extension.section?{...extension.section,afterSectionId:extension.section.afterSectionId===required[0]!.id?null:extension.section.afterSectionId}:null,...("diagnostic" in extension?{diagnostic:extension.diagnostic?{...extension.diagnostic,afterSectionId:extension.diagnostic.afterSectionId===required[0]!.id?null:extension.diagnostic.afterSectionId}:null}:{})}:undefined;
  const supplementalContent=sections.length>0||teamExtension?.section||teamExtension&&"diagnostic" in teamExtension&&teamExtension.diagnostic?<PageRenderer presentation={{...presentation,sections,teamExtension}} data={{artwork:content.artwork}} siteName={siteName} demonstration={demonstration} includeContactForm={false} contactMode={contactMode} applyTranslation={false}/>:undefined;
  return <ArtworkExperience id={required[0]!.id} content={content} InformationView={ArtworkInformation} ProgressView={ArtworkProgress} supplementalContent={supplementalContent}/>;
}
