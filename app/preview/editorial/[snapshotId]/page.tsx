import {loadPublicNavigation} from "@/lib/navigation/load-public";
import{PreviewReadySignal}from"@/components/preview/PreviewReadySignal";
import{EditorialInteractionProvider}from"@/components/editorial/immersive/EditorialInteractionProvider";
import{articleKindDescriptors}from"@/lib/editorial/article-kind";
import {connection} from "next/server";
import {Suspense} from "react";
import {readEditorialPreview} from "@/lib/editorial/preview-client";
import {readPreviewStatus} from "@/lib/presentation/preview-client";
import {getPublicPresentation} from "@/lib/presentation/client";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {configuredLocalePolicy,loadConfig,stringValue} from "@/lib/config/env";
import {SiteThemeProvider} from "@/branding/SiteThemeProvider";
import {ClientComponentsProvider} from "@/clients/ClientComponentsProvider";
import {SiteContentProvider} from "@/components/SiteContentProvider";
import {SiteHeader} from "@/components/SiteHeader";
import {SiteFooter} from "@/components/SiteFooter";
import {SiteLogo} from "@/components/SiteLogo";
import {EditorialArticleDocument} from "@/components/editorial/PublicArticleDocument";
import {EditorialPreviewArtworkBoundary} from "@/components/preview/EditorialPreviewArtworkBoundary";
import {PreviewUnavailable,PreviewLoading} from "@/components/preview/PreviewShell";
type Props={params:Promise<{snapshotId:string}>};
export default function EditorialPreviewPage(props:Props){return <Suspense fallback={<PreviewLoading/>}><PreviewDocument {...props}/></Suspense>;}
async function PreviewDocument({params}:Props){
 await connection();let view;
 try{
  const {snapshotId}=await params,status=await readPreviewStatus();if(status.kind!=="article"||status.snapshotId!==snapshotId)throw new Error();
  const config=loadConfig(),policy=configuredLocalePolicy(config),article=await readEditorialPreview(snapshotId);if(article.id!==status.articleId||article.kind!==status.articleKind)throw new Error();
  const locale=status.locale,themeLocale=policy.locales.some(item=>item.code===locale)?locale:policy.defaultLocale;
  const [presentation,site]=await Promise.all([getPublicPresentation(articleKindDescriptors[article.kind].section,themeLocale),loadSiteContent()]);
  const navigation=await loadPublicNavigation(themeLocale,presentation.releaseId);
  view={article,locale,policy,presentation,site,navigation,profile:stringValue(config,"SITE_PROFILE")};
 }catch{return <div data-preview-unavailable><PreviewUnavailable/></div>;}
 const {article,locale,policy,presentation,site,navigation,profile}=view;
 return <div lang={locale}><PreviewReadySignal adminOrigin={stringValue(loadConfig(),"ADMIN_ORIGIN")} snapshotId={(await params).snapshotId}/><SiteThemeProvider theme={presentation.theme} fonts={presentation.fontFiles}><SiteContentProvider messages={site.messages} locale={locale} defaultLocale={policy.defaultLocale} locales={policy.locales.map(item=>item.code)}><ClientComponentsProvider profileId={profile}><EditorialInteractionProvider enabled={loadConfig().EDITORIAL_IMMERSIVE_RENDER_ENABLED!=="false"}><EditorialPreviewArtworkBoundary>
  <SiteHeader navigation={navigation} languageCount={policy.locales.length} siteName={site.siteName} locale={locale} defaultLocale={policy.defaultLocale} messages={site.messages} section={articleKindDescriptors[article.kind].section} logo={<SiteLogo logo={site.logo} siteName={site.siteName}/>} languageControl={<span lang={locale}>{locale.toUpperCase()}</span>}/>
  <main id="contenu" tabIndex={-1} data-page-key={articleKindDescriptors[article.kind].section}><EditorialArticleDocument article={article}/></main><SiteFooter presentation={presentation} siteName={site.siteName} description={site.description} logo={<SiteLogo logo={site.logo} siteName={site.siteName}/>} languageControl={<span lang={locale}>{locale.toUpperCase()}</span>}/>
 </EditorialPreviewArtworkBoundary></EditorialInteractionProvider></ClientComponentsProvider></SiteContentProvider></SiteThemeProvider></div>;
}
