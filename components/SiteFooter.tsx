"use client";
import {useConsent} from './privacy/ConsentProvider';
import type {ReactNode} from "react";
import type {PublicPresentation,ResolvedFooter} from "../lib/presentation/types";
import {selectPresentation} from "../lib/presentation/select-presentation";
import {useSiteLocale} from "./SiteLocaleBoundary";
import {useSiteContent} from "./SiteContentProvider";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function SiteFooter({siteName,description,presentation,footer,logo,languageControl,commerceTracking=false}:{commerceTracking?:boolean;siteName:string;description:string;presentation?:Omit<PublicPresentation,"releaseId">;footer?:ResolvedFooter|null;logo?:ReactNode;languageControl?:ReactNode}){
 const consent=useConsent(),dynamic=useSiteLocale(),{locale,defaultLocale,scope}=useSiteContent(),{Footer}=useClientComponents();
 const selected=presentation?selectPresentation(presentation,dynamic?.translation?.presentation):undefined;
 const resolved=selected?selected.footer??null:footer??null;
 return <Footer privacyControl={scope==='preview'?undefined:<button type="button" onClick={consent.openPreferences} style={{border:0,padding:0,background:'none',font:'inherit',color:'inherit',cursor:'pointer',textDecoration:'underline',textUnderlineOffset:4}}>{locale==='fr'?'Confidentialité et cookies':'Privacy and cookies'}</button>} extraLinks={scope==='preview'||!commerceTracking?undefined:[{href:(locale===defaultLocale?'':'/'+locale)+'/store/order-tracking',label:locale==='fr'?'Suivi de commande':'Order tracking'},{href:(locale===defaultLocale?'':'/'+locale)+'/terms',label:locale==='fr'?'CGV':'Terms of sale'},{href:(locale===defaultLocale?'':'/'+locale)+'/privacy',label:locale==='fr'?'Confidentialité':'Privacy'},{href:(locale===defaultLocale?'':'/'+locale)+'/store/withdrawal',label:locale==='fr'?'Rétractation':'Withdrawal'}]} footer={resolved} siteName={siteName} description={description} logo={logo} languageControl={languageControl} homeHref={scope==="preview"?"/preview/render/"+locale:locale===defaultLocale?"/":"/"+locale} socialLabel={locale==="fr"?"Suivez-nous":"Follow us"} legalHref={scope==="preview"?undefined:(locale===defaultLocale?"":"/"+locale)+"/legal"} legalLabel={locale==="fr"?"Mentions légales":"Legal notice"}/>;
}
