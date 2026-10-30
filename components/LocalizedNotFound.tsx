import {headers} from "next/headers";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {localizedPath} from "@/lib/i18n/routes";
import {FreshLink} from "./FreshLink";
import {ArtworkRouteFrame} from "./artworks/ArtworkRouteFrame";
import {ArtworkRouteState} from "./artworks/ArtworkRouteState";
export async function LocalizedNotFound(){
  const site=await loadSiteContent(),artwork=(await headers()).get("x-site-error")==="artwork";
  if(artwork)return <ArtworkRouteFrame locale={site.locale}><ArtworkRouteState status="unavailable"/></ArtworkRouteFrame>;
  return <section><h1>{site.messages[artwork?"error.artworkNotFoundTitle":"error.pageNotFoundTitle"]}</h1><p>{site.messages[artwork?"error.artworkNotFoundMessage":"error.pageNotFoundMessage"]}</p><FreshLink className="button" href={localizedPath("/artworks",site.locale,site.policy.defaultLocale)}>{site.messages["error.viewArtworks"]}</FreshLink></section>;
}
