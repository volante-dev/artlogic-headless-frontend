import "server-only";
import {Suspense} from "react";
import {connection} from "next/server";
import {loadSiteContent} from "../i18n/load-site-content";
import {loadConfig} from "../config/env";
import {PublicApiError} from "../api/client";
import {resolveArtworkDocument,artworkMetadata} from "./metadata";
import {ArtworkRouteFrame} from "../../components/artworks/ArtworkRouteFrame";
import {ArtworkRouteState} from "../../components/artworks/ArtworkRouteState";
import {ArtworkFreshnessBoundary} from "../../components/artworks/ArtworkFreshnessBoundary";
export type ArtworkRouteProps={params:Promise<{locale:string;artworkRef:string}>};
async function Frame({params,children}:ArtworkRouteProps&{children:React.ReactNode}){
  const {artworkRef}=await params,site=await loadSiteContent();return <ArtworkRouteFrame reference={artworkRef} locale={site.locale} messages={site.messages}>{children}</ArtworkRouteFrame>;
}
export function ArtworkLayout(props:ArtworkRouteProps&{children:React.ReactNode}){return <Suspense fallback={<ArtworkRouteFrame><ArtworkRouteState/></ArtworkRouteFrame>}><Frame {...props}/></Suspense>;}
export async function generateArtworkMetadata({params}:ArtworkRouteProps){const {artworkRef}=await params,site=await loadSiteContent();return artworkMetadata(artworkRef,site.locale);}
async function Document({params}:ArtworkRouteProps){
  await connection();
  const {artworkRef}=await params,site=await loadSiteContent();let document;
  try{document=await resolveArtworkDocument(artworkRef,site.locale);}catch(error){if(error instanceof PublicApiError&&error.status===404)return <ArtworkRouteState status="unavailable"/>;throw error;}
  return <ArtworkFreshnessBoundary initial={document.experience} presentation={document.presentation} siteName={site.siteName} demonstration={loadConfig().DATA_MODE==="mock"}/>;
}
export function ArtworkPage(props:ArtworkRouteProps){return <Suspense fallback={<ArtworkRouteState/>}><Document {...props}/></Suspense>;}
