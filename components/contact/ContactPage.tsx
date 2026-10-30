import {loadConfig} from "../../lib/config/env";
import {readContactConfiguration,readContactArtwork} from "../../lib/contact/server";
import {loadPublicPresentation} from "../../lib/presentation/load-public";
import {loadSiteContent} from "../../lib/i18n/load-site-content";
import {PageRenderer} from "../../page-composer/PageRenderer";
import {ClientComponentsProvider} from "../../clients/ClientComponentsProvider";
import {ContactForm} from "./ContactForm";
import {randomUUID} from "node:crypto";
import {OriginFreshnessBeacon} from "../artworks/OriginFreshnessBeacon";
export async function ContactPage({searchParams}:{searchParams?:Promise<{artwork?:string|string[]}>}={}){
 const [configuration,site]=await Promise.all([readContactConfiguration(),loadSiteContent()]);let presentation;try{presentation=await loadPublicPresentation();}catch{/* A presentation outage must not block a general enquiry. */}
 const query=await(searchParams??Promise.resolve({artwork:undefined})),id=query.artwork,artwork=typeof id==="string"?await readContactArtwork(id,site.locale,site.policy.defaultLocale,site.messages["artwork.untitled"]):null;
 const sections=presentation?.sections.length??0;
 return <ClientComponentsProvider profileId={presentation?.profileId??"default"}>{presentation&&sections>0&&<PageRenderer includeContactForm={false} presentation={presentation} siteName={site.siteName} demonstration={loadConfig().DATA_MODE==="mock"}/>}<ContactForm artwork={artwork} contextUnavailable={id!==undefined&&!artwork} configuration={configuration} mode={loadConfig().DATA_MODE==="mock"?"captured":"live"} headingLevel={sections>0?"h2":"h1"}/><OriginFreshnessBeacon nonce={randomUUID()}/></ClientComponentsProvider>;
}
