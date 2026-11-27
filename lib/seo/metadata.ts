import {runtimeText,type SiteMessages} from '../i18n/site-messages';
import type {Metadata} from "next";
import {localizedPath,type RoutingPolicy, type Section} from "../i18n/routes";

export function pageAlternates(path:string,locale:string,policy:RoutingPolicy,origin:string):NonNullable<Metadata["alternates"]>{
 const languages=Object.fromEntries(policy.locales.map(l=>[l.code,new URL(localizedPath(path,l.code,policy.defaultLocale),origin).href]));
 return {canonical:new URL(localizedPath(path,locale,policy.defaultLocale),origin).href,languages:{...languages,"x-default":new URL(localizedPath(path,policy.defaultLocale,policy.defaultLocale),origin).href}};
}

/** Factual fallbacks; descriptions authored in the CMS always take precedence. */
export function sectionDescription(section:Section|"home",locale:string,siteName:string,messages:SiteMessages):string{
 const ids={home:'seo.section.home',artworks:'seo.section.artworks',news:'seo.section.news',exhibitions:'seo.section.exhibitions',publications:'seo.section.publications',expertise:'seo.section.expertise',contact:'seo.section.contact'} as const;
 return runtimeText(messages,locale,ids[section],{siteName});
}
