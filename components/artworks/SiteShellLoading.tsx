"use client";
import {useSyncExternalStore} from "react";
import {classifyRoute,localizedPath,type RoutingPolicy} from "../../lib/i18n/routes";
import {initialMessages} from "../../lib/i18n/messages.generated";
import {SiteContentProvider} from "../SiteContentProvider";
import {SiteThemeProvider} from "../../branding/SiteThemeProvider";
import projection from "../../clients/default/projection.json";
import type {PresentationTheme} from "../../lib/presentation/types";
import {ArtworkDialogShell} from "./ArtworkDialogShell";
import {ArtworkRouteState} from "./ArtworkRouteState";
const subscribe=(notify:()=>void)=>{window.addEventListener("popstate",notify);return ()=>window.removeEventListener("popstate",notify);};
export function SiteShellLoading({policy,initialLocale=policy.defaultLocale}:{policy:RoutingPolicy;initialLocale?:string}){
  // This is itself a Suspense fallback: a Next URL hook here would suspend the fallback.
  const path=useSyncExternalStore(subscribe,()=>window.location.pathname,()=>localizedPath("/",initialLocale,policy.defaultLocale));
  const route=classifyRoute(path,policy),messages=initialMessages(route.locale,policy.defaultLocale);
  if(route.kind!=="artwork")return null;
  return <SiteThemeProvider theme={projection as PresentationTheme} fonts={[]}><SiteContentProvider messages={messages} locale={route.locale} defaultLocale={policy.defaultLocale} locales={policy.locales.map(l=>l.code)}>
    <ArtworkDialogShell artworkRef={route.artworkId} locale={route.locale}><ArtworkRouteState/></ArtworkDialogShell>
  </SiteContentProvider></SiteThemeProvider>;
}
