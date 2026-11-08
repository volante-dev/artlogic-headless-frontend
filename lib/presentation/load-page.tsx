import {loadHeaderRouteContext} from "../header/load-route-context";
import {HeaderRouteCommit} from "../../components/header/HeaderRouteCommit";
import "server-only";
import {notFound} from "next/navigation";
import {loadConfig} from "../config/env";
import {loadSiteContent} from "../i18n/load-site-content";
import {getArtwork,listArtworks} from "../api/artworks";
import {PublicApiError} from "../api/client";
import {loadPublicPresentation} from "./load-public";
import {PageRenderer} from "../../page-composer/PageRenderer";
import type {PageData} from "../../sections/types";
import {getGalleryCatalog} from "../artworks/server";
import {parseCatalogQuery,type CatalogParams} from "../artworks/catalog-query";
import {randomUUID} from "node:crypto";
import {OriginFreshnessBeacon} from "../../components/artworks/OriginFreshnessBeacon";
/** All I/O and current publication checks finish before data reaches replaceable views. */
export async function PublicPage({searchParams,artworkId}:{searchParams?:Promise<CatalogParams>;artworkId?:string}={}){
  const [presentation,site]=await Promise.all([loadPublicPresentation(),loadSiteContent()]),data:PageData={},locale=presentation.locale;
  if(presentation.pageKey==="artworks"){
    const params=await(searchParams??Promise.resolve({}));
    let query:ReturnType<typeof parseCatalogQuery>;
    try{query=parseCatalogQuery(params);}catch{data.catalog={kind:"error",code:"invalid_request",q:"",pageSize:20};}
    if(!data.catalog){
      try{data.catalog=query!.kind==="legacy"?{kind:"legacy",page:await listArtworks(query!.cursor,{restartOnChange:false,display:"plp",locale})}:{kind:"numbered",page:await getGalleryCatalog({...query!.query,locale},true)};}
      catch(error){
        if(!(error instanceof PublicApiError))throw error;
        const code=error.code;
        data.catalog={kind:"error",code:code==="catalog_changed"||code==="page_out_of_range"||code==="rate_limited"||code==="invalid_request"?code:"service_unavailable",q:query!.kind==="numbered"?query!.query.q??"":"",pageSize:query!.kind==="numbered"?query!.query.pageSize??20:20};
      }
    }
  }
  if(presentation.pageKey==="artworkDetail"){
    if(!artworkId)notFound();try{data.artwork=await getArtwork(artworkId,locale);}catch(error){if(error instanceof PublicApiError&&error.status===404)notFound();throw error;}
  }
  return <><PageRenderer presentation={presentation} siteName={site.siteName} contactMode={loadConfig().DATA_MODE==="mock"?"captured":"live"} demonstration={loadConfig().DATA_MODE==="mock"} data={data}/><OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
