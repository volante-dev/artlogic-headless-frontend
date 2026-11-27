"use client";
import {ArtworkDialogShell} from "./ArtworkDialogShell";
import {SiteContentProvider,useSiteContent} from "../SiteContentProvider";
import {initialMessages,type SiteMessages} from "../../lib/i18n/site-messages";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import {useSiteLocale} from "../SiteLocaleBoundary";
export function ArtworkRouteFrame({children,reference,locale,messages,publicAddress}:{children:React.ReactNode;reference?:string;locale?:string;messages?:SiteMessages;publicAddress?:import("../../lib/artworks/addresses").ArtworkAddress}){
  const site=useSiteContent(),navigation=useArtworkNavigation(),translation=useSiteLocale()?.translation,activeLocale=translation?.artwork?translation.locale:navigation?.activeLocale??locale??site.locale;
  const localized=translation?.artwork?translation.messages:activeLocale===site.locale?site.messages:messages&&locale===activeLocale?messages:initialMessages(activeLocale,site.defaultLocale);
  return <SiteContentProvider messages={localized} locale={activeLocale} defaultLocale={site.defaultLocale} locales={site.locales} scope={site.scope}><ArtworkDialogShell publicAddress={translation?.artwork?.artwork.publicAddress??navigation?.publicAddress??publicAddress} artworkRef={reference} locale={activeLocale} suspended={navigation?.restoring}>{children}</ArtworkDialogShell></SiteContentProvider>;
}
