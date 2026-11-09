'use client';
import {useHeaderNavigation} from './HeaderNavigationProvider';
import {HeaderNavigationError} from './HeaderNavigationError';
import {EditorialInteractionProvider} from '../editorial/immersive/EditorialInteractionProvider';
import {FormSessionsProvider} from '../forms/FormSessionProvider';
import {SiteLocaleBoundary} from '../SiteLocaleBoundary';
import {SiteThemeProvider} from '../../branding/SiteThemeProvider';
import {ClientComponentsProvider} from '../../clients/ClientComponentsProvider';
import {ArtworkNavigationBoundary} from '../artworks/ArtworkNavigationBoundary';
import {SiteHeader} from '../SiteHeader';
import {SiteFooter} from '../SiteFooter';
import {SiteLogo} from '../SiteLogo';
import {LanguageSelector} from '../LanguageSelector';
import {classifyRoute} from '../../lib/i18n/routes';
import fallbackTheme from '../../clients/default/projection.json';
import type {PresentationTheme} from '../../lib/presentation/types';
export function HeaderShell({children,artwork,immersiveEnabled}:{children:React.ReactNode;artwork?:React.ReactNode;immersiveEnabled:boolean}){
 const {snapshot,status,mainRef}=useHeaderNavigation()!,{site,presentation,navigation,article}=snapshot;
 const route=classifyRoute(snapshot.hrefKey.split('?')[0]!,site.policy),query=snapshot.hrefKey.includes('?')?'?'+snapshot.hrefKey.split('?')[1]:'';
 const language=<LanguageSelector policy={site.policy} locale={site.locale} path={route.logicalPath} query={query} label={site.messages['header.languageLabel']}/>;
 const logo=<SiteLogo key={site.logo?.id??'none'} logo={site.logo} siteName={site.siteName}/>;
 return <FormSessionsProvider><EditorialInteractionProvider enabled={immersiveEnabled}><SiteLocaleBoundary contextIdentity={snapshot.requestId} pageIdentity={snapshot.pageIdentity} presentationReleaseId={presentation?.releaseId} article={article} messages={site.messages} locale={site.locale} policy={site.policy} profileId={presentation?.profileId??'default'} siteName={site.siteName}><SiteThemeProvider theme={presentation?.theme??fallbackTheme as PresentationTheme} fonts={presentation?.fontFiles??[]}><ClientComponentsProvider profileId={presentation?.profileId??'default'}><ArtworkNavigationBoundary artwork={artwork} canonical={children}>
 <SiteHeader navigation={navigation} languageCount={site.policy.locales.length} galeristNavigation={presentation?.galeristNavigation} galeristActive={snapshot.pageKey==='galerist'} immersive={snapshot.immersive&&route.kind==='home'&&status==='ready'} whiteLogo={site.whiteLogo?<SiteLogo key={site.whiteLogo.id} logo={site.whiteLogo} siteName={site.siteName}/>:undefined} logo={logo} siteName={site.siteName} locale={site.locale} defaultLocale={site.policy.defaultLocale} messages={site.messages} section={snapshot.section} languageControl={language}/>
 <HeaderNavigationError/>
 <main ref={mainRef} id="contenu" data-page-key={snapshot.pageKey} data-header-state={status} tabIndex={-1} inert={status!=='ready'||undefined} aria-busy={status!=='ready'||undefined} style={{visibility:status==='ready'?undefined:'hidden'}}>{children}</main>
 <SiteFooter presentation={presentation} siteName={site.siteName} description={site.description} logo={logo} languageControl={language}/>
 </ArtworkNavigationBoundary></ClientComponentsProvider></SiteThemeProvider></SiteLocaleBoundary></EditorialInteractionProvider></FormSessionsProvider>;
}
