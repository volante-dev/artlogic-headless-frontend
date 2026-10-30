import {Suspense} from "react";
import {locale} from "next/root-params";
import {ArtworkOpeningBoundary} from "@/components/artworks/ArtworkOpeningBoundary";
import type {Metadata,Viewport} from "next";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {SiteShell} from "@/components/SiteShell";
import {RestoreFreshness} from "@/components/RestoreFreshness";
import {SiteShellLoading} from "@/components/artworks/SiteShellLoading";
import {configuredLocalePolicy,loadConfig} from "@/lib/config/env";
import "../globals.css";
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};
export function generateStaticParams(){return [{locale:"fr"},{locale:"en"}];}
export async function generateMetadata():Promise<Metadata>{const site=await loadSiteContent();return {title:site.siteName,description:site.description,metadataBase:new URL(site.siteOrigin)};}
export default async function RootLayout({children,artwork}:{children:React.ReactNode;artwork:React.ReactNode}){const activeLocale=await locale();return <html lang={activeLocale}><body><RestoreFreshness/><ArtworkOpeningBoundary><Suspense fallback={<SiteShellLoading policy={configuredLocalePolicy(loadConfig())} initialLocale={activeLocale}/>}><SiteShell artwork={artwork}>{children}</SiteShell></Suspense></ArtworkOpeningBoundary></body></html>;}
