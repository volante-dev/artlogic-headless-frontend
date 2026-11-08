import {loadHeaderRouteContext} from "../../lib/header/load-route-context";
import {HeaderRouteCommit} from "../header/HeaderRouteCommit";
import {loadConfig} from "../../lib/config/env";
import {readContactConfiguration,readContactArtwork} from "../../lib/contact/server";
import {loadPublicPresentation} from "../../lib/presentation/load-public";
import {loadSiteContent} from "../../lib/i18n/load-site-content";
import {PageRenderer} from "../../page-composer/PageRenderer";
import {ClientComponentsProvider} from "../../clients/ClientComponentsProvider";
import {ContactForm} from "./ContactForm";
import {randomUUID} from "node:crypto";
import {OriginFreshnessBeacon} from "../artworks/OriginFreshnessBeacon";
import {contactFormReference} from "../../lib/forms/contact-compatibility.generated";
import {ContactFormsIntro} from "./ContactFormsIntro";
export async function ContactPage({searchParams}:{searchParams?:Promise<{artwork?:string|string[]}>}={}){
 const config=loadConfig(),cutover=config.FORMS_ENABLED==="true"&&config.FORMS_CONTACT_CUTOVER==="true";
 const [configuration,site]=await Promise.all([cutover?Promise.resolve(null):readContactConfiguration(),loadSiteContent()]);let presentation;try{presentation=await loadPublicPresentation();}catch{/* The legacy path remains available only before cutover. */}
 const query=await(searchParams??Promise.resolve({artwork:undefined})),id=query.artwork,artwork=typeof id==="string"?await readContactArtwork(id,site.locale,site.policy.defaultLocale,site.messages["artwork.untitled"]):null;
 if(cutover){
  let reference;try{if(presentation)reference=contactFormReference(presentation.sections);}catch{/* Invalid page configuration must not fall back to SMTP. */}
  const unavailable=id!==undefined&&!artwork,closed=!presentation||!reference;
  return <ClientComponentsProvider profileId={presentation?.profileId??"default"}><ContactFormsIntro artwork={artwork} unavailable={unavailable} closed={closed}/>{presentation&&reference&&!unavailable&&<PageRenderer presentation={presentation} includeContactForm={false} includePageTitle={false} contactStrategy="forms" formArtworkId={artwork?.id} data={artwork?{contactArtwork:artwork}:undefined} siteName={site.siteName} demonstration={config.DATA_MODE==="mock"}/>}<OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></ClientComponentsProvider>;
 }
 if(presentation)presentation={...presentation,sections:presentation.sections.filter(section=>section.type!=="form"&&section.type!=="formImage")};
 const sections=presentation?.sections.length??0;
 return <ClientComponentsProvider profileId={presentation?.profileId??"default"}>{presentation&&sections>0&&<PageRenderer includeContactForm={false} contactStrategy="legacy" presentation={presentation} siteName={site.siteName} demonstration={loadConfig().DATA_MODE==="mock"}/>}<ContactForm artwork={artwork} contextUnavailable={id!==undefined&&!artwork} configuration={configuration} mode={loadConfig().DATA_MODE==="mock"?"captured":"live"} headingLevel={sections>0?"h2":"h1"}/><OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></ClientComponentsProvider>;
}
