"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useConsent} from './privacy/ConsentProvider';
import type {ReactNode} from "react";
import type {PublicPresentation,ResolvedFooter} from "../lib/presentation/types";
import {selectPresentation} from "../lib/presentation/select-presentation";
import {useSiteLocale} from "./SiteLocaleBoundary";
import {useSiteContent} from "./SiteContentProvider";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function SiteFooter({siteName,description,presentation,footer,logo,languageControl,commerceTracking=false}:{commerceTracking?:boolean;siteName:string;description:string;presentation?:Omit<PublicPresentation,"releaseId">;footer?:ResolvedFooter|null;logo?:ReactNode;languageControl?:ReactNode}){
 const text=useRuntimeText();
 const consent=useConsent(),dynamic=useSiteLocale(),{locale,defaultLocale,scope}=useSiteContent(),{Footer}=useClientComponents();
 const selected=presentation?selectPresentation(presentation,dynamic?.translation?.presentation):undefined;
 const resolved=selected?selected.footer??null:footer??null;
 return <Footer privacyControl={scope==='preview'?undefined:<button type="button" onClick={consent.openPreferences} style={{border:0,padding:0,background:'none',font:'inherit',color:'inherit',cursor:'pointer',textDecoration:'underline',textUnderlineOffset:4}}>{text("ui.ee9cf4fd9e21aa5a")}</button>} extraLinks={scope==='preview'||!commerceTracking?undefined:[{href:(locale===defaultLocale?'':'/'+locale)+'/store/order-tracking',label:text("ui.4a81ae035917847c")},{href:(locale===defaultLocale?'':'/'+locale)+'/terms',label:text("ui.2ac674c28176659d")},{href:(locale===defaultLocale?'':'/'+locale)+'/privacy',label:text("ui.582ede75d19776b3")},{href:(locale===defaultLocale?'':'/'+locale)+'/store/withdrawal',label:text("ui.f8200104ad30d446")}]} footer={resolved} siteName={siteName} description={description} logo={logo} languageControl={languageControl} homeHref={scope==="preview"?"/preview/render/"+locale:locale===defaultLocale?"/":"/"+locale} socialLabel={text("ui.31a1706035212993")} legalHref={scope==="preview"?undefined:(locale===defaultLocale?"":"/"+locale)+"/legal"} legalLabel={text("ui.7ef3ccbc906cdff1")}/>;
}
