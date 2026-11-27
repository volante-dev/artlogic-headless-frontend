import {LanguageFailureProvider} from '@/components/LanguageFailure';
import {ArtworkViewProvider} from "@/components/artworks/ArtworkViewProvider";
import {resolveArtworkView} from "@/lib/artworks/artwork-view";
import {ArtworkDocumentBoot} from "@/components/artworks/ArtworkDocumentBoot";
import "@/components/artworks/ArtworkDocument.module.css";
import {FocusVisibility} from "@/components/FocusVisibility";
import {MediaDisplayProvider} from "@/lib/media/MediaDisplayProvider";
import {Suspense} from "react";
import {locale} from "next/root-params";
import {ArtworkOpeningBoundary} from "@/components/artworks/ArtworkOpeningBoundary";
import type {Metadata,Viewport} from "next";
import {SiteShell} from "@/components/SiteShell";
import {SiteShellLoading} from "@/components/artworks/SiteShellLoading";
import {configuredLocalePolicy,loadConfig,numberValue,stringValue} from "@/lib/config/env";
import "../globals.css";
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};
export function generateStaticParams(){return configuredLocalePolicy(loadConfig()).locales.map(language=>({locale:language.code}));}
export function generateMetadata():Metadata{const config=loadConfig();return {title:stringValue(config,'SITE_NAME'),description:stringValue(config,'SITE_DESCRIPTION'),metadataBase:new URL(stringValue(config,'SITE_ORIGIN')),icons:{icon:[{url:'/favicon.ico',type:'image/x-icon',sizes:'16x16 32x32 48x48'},{url:'/favicon.ico?file=icon-32.png',type:'image/png',sizes:'32x32'},{url:'/favicon.ico?file=icon-192.png',type:'image/png',sizes:'192x192'},{url:'/favicon.ico?file=icon-512.png',type:'image/png',sizes:'512x512'}],apple:[{url:'/favicon.ico?file=apple-touch-icon.png',sizes:'180x180',type:'image/png'}]}};}
export default async function RootLayout({children,artwork}:{children:React.ReactNode;artwork:React.ReactNode}){const candidate=await locale(),activeLocale=typeof candidate==="string"&&/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(candidate)?candidate:undefined;return <html lang={new Intl.Locale(activeLocale??stringValue(loadConfig(),'SITE_DEFAULT_LOCALE')).toString()} data-artwork-document="static" suppressHydrationWarning><head><ArtworkDocumentBoot/></head><body data-public-responsive={loadConfig().PUBLIC_IMAGE_RESPONSIVE_ENABLED==="true"?"true":undefined}><noscript><style>{`div[hidden]:has(footer){display:contents!important}#editorial-native-link{display:block;margin:24px;padding:16px}body:not(:has([data-editorial-document])) #editorial-native-link{display:none}`}</style></noscript><LanguageFailureProvider locale={new Intl.Locale(activeLocale??stringValue(loadConfig(),'SITE_DEFAULT_LOCALE')).toString()} defaultLocale={stringValue(loadConfig(),'SITE_DEFAULT_LOCALE')}><FocusVisibility/><MediaDisplayProvider responsive={loadConfig().PUBLIC_IMAGE_RESPONSIVE_ENABLED==="true"} descriptorTimeoutMs={numberValue(loadConfig(),"PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS")} budgetMs={numberValue(loadConfig(),"PUBLIC_MEDIA_LOAD_TIMEOUT_MS")}><ArtworkViewProvider mode={resolveArtworkView(loadConfig().PRESENTATION_ARTWORK_VIEW)}><ArtworkOpeningBoundary><Suspense fallback={<SiteShellLoading policy={configuredLocalePolicy(loadConfig())} initialLocale={activeLocale}/>}><SiteShell artwork={artwork}>{children}</SiteShell></Suspense></ArtworkOpeningBoundary></ArtworkViewProvider></MediaDisplayProvider></LanguageFailureProvider></body></html>;}
