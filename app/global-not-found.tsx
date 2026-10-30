import {headers} from "next/headers";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {SiteShell} from "@/components/SiteShell";
import {LocalizedNotFound} from "@/components/LocalizedNotFound";
import {RestoreFreshness} from "@/components/RestoreFreshness";
import {ArtworkRouteFrame} from "@/components/artworks/ArtworkRouteFrame";
import {ArtworkRouteState} from "@/components/artworks/ArtworkRouteState";
import "./globals.css";
export const instant=false;
export async function generateMetadata(){const site=await loadSiteContent(),artwork=(await headers()).get("x-site-error")==="artwork";return {title:site.messages[artwork?"error.artworkNotFoundTitle":"error.pageNotFoundTitle"]+" — "+site.siteName,robots:{index:false,follow:false}};}
// A routing-level 404 fixes the status before streaming while sharing the normal header.
export default async function GlobalNotFound(){const site=await loadSiteContent(),context=await headers(),artwork=context.get("x-site-error")==="artwork",reference=(context.get("x-site-path")??"").split("/")[2]??"unavailable";return <html lang={site.locale}><body><RestoreFreshness/><SiteShell>{artwork?<ArtworkRouteFrame locale={site.locale} reference={reference}><ArtworkRouteState status="unavailable"/></ArtworkRouteFrame>:<LocalizedNotFound/>}</SiteShell></body></html>;}
