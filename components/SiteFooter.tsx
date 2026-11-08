"use client";
import type {ReactNode} from "react";
import type {PublicPresentation,ResolvedFooter} from "../lib/presentation/types";
import {selectPresentation} from "../lib/presentation/select-presentation";
import {useSiteLocale} from "./SiteLocaleBoundary";
import {useSiteContent} from "./SiteContentProvider";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function SiteFooter({siteName,description,presentation,footer,logo,languageControl}:{siteName:string;description:string;presentation?:Omit<PublicPresentation,"releaseId">;footer?:ResolvedFooter|null;logo?:ReactNode;languageControl?:ReactNode}){
 const dynamic=useSiteLocale(),{locale,defaultLocale,scope}=useSiteContent(),{Footer}=useClientComponents();
 const selected=presentation?selectPresentation(presentation,dynamic?.translation?.presentation):undefined;
 const resolved=selected?selected.footer??null:footer??null;
 return <Footer footer={resolved} siteName={siteName} description={description} logo={logo} languageControl={languageControl} homeHref={scope==="preview"?"/preview/render/"+locale:locale===defaultLocale?"/":"/"+locale} socialLabel={locale==="fr"?"Suivez-nous":"Follow us"}/>;
}
