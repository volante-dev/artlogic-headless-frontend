import {FocusVisibility} from "@/components/FocusVisibility";
import {MediaDisplayProvider} from "@/lib/media/MediaDisplayProvider";
import {Suspense} from "react";
import {locale} from "next/root-params";
import {ArtworkOpeningBoundary} from "@/components/artworks/ArtworkOpeningBoundary";
import type {Metadata,Viewport} from "next";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {SiteShell} from "@/components/SiteShell";
import {RestoreFreshness} from "@/components/RestoreFreshness";
import {SiteShellLoading} from "@/components/artworks/SiteShellLoading";
import {configuredLocalePolicy,loadConfig,numberValue} from "@/lib/config/env";
import "../globals.css";
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};
export function generateStaticParams(){return [{locale:"fr"},{locale:"en"}];}
export async function generateMetadata():Promise<Metadata>{const site=await loadSiteContent();return {title:site.siteName,description:site.description,metadataBase:new URL(site.siteOrigin)};}
export default async function RootLayout({children,artwork}:{children:React.ReactNode;artwork:React.ReactNode}){const activeLocale=await locale();return <html lang={activeLocale}><body data-public-responsive={loadConfig().PUBLIC_IMAGE_RESPONSIVE_ENABLED==="true"?"true":undefined}><noscript><style>{`div[hidden]:has(footer){display:contents!important}#editorial-native-link{display:block;margin:24px;padding:16px}body:not(:has([data-editorial-document])) #editorial-native-link{display:none}`}</style><a id="editorial-native-link" href="?reader=native">{activeLocale==="en"?"Read this article without JavaScript":"Lire cet article sans JavaScript"}</a></noscript><FocusVisibility/><RestoreFreshness/><MediaDisplayProvider responsive={loadConfig().PUBLIC_IMAGE_RESPONSIVE_ENABLED==="true"} descriptorTimeoutMs={numberValue(loadConfig(),"PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS")} budgetMs={numberValue(loadConfig(),"PUBLIC_MEDIA_LOAD_TIMEOUT_MS")}><ArtworkOpeningBoundary><Suspense fallback={<SiteShellLoading policy={configuredLocalePolicy(loadConfig())} initialLocale={activeLocale}/>}><SiteShell artwork={artwork}>{children}</SiteShell></Suspense></ArtworkOpeningBoundary></MediaDisplayProvider></body></html>;}
