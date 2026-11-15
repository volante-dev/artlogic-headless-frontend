import type {Metadata} from "next";
import {localizedPath,type RoutingPolicy, type Section} from "../i18n/routes";

export function pageAlternates(path:string,locale:string,policy:RoutingPolicy,origin:string):NonNullable<Metadata["alternates"]>{
 const languages=Object.fromEntries(policy.locales.map(l=>[l.code,new URL(localizedPath(path,l.code,policy.defaultLocale),origin).href]));
 return {canonical:new URL(localizedPath(path,locale,policy.defaultLocale),origin).href,languages:{...languages,"x-default":new URL(localizedPath(path,policy.defaultLocale,policy.defaultLocale),origin).href}};
}

/** Factual fallbacks; descriptions authored in the CMS always take precedence. */
export function sectionDescription(section:Section|"home",locale:string,siteName:string):string{
 const en=locale.startsWith("en");
 const descriptions:Record<Section|"home",string> = en?{
  home:`Discover African, Oceanic and American art at ${siteName}, a Paris gallery specialising in masks and sculpture.`,
  artworks:`Explore the works of African, Oceanic and American art presented by ${siteName}.`,
  news:`Discover news, projects and collaborations from ${siteName}.`,
  exhibitions:`Explore current and past exhibitions at ${siteName}.`,
  publications:`Discover books and publications from ${siteName}.`,
  expertise:`Contact ${siteName} about the appraisal of a work of African, Oceanic or American art.`,
  contact:`Contact ${siteName} to plan your visit or enquire about an artwork.`,
 }:{
  home:`Découvrez les arts d’Afrique, d’Océanie et des Amériques à la ${siteName}, galerie parisienne spécialisée dans les masques et la statuaire.`,
  artworks:`Explorez les œuvres d’art d’Afrique, d’Océanie et des Amériques présentées par la ${siteName}.`,
  news:`Découvrez les actualités, les projets et les collaborations de la ${siteName}.`,
  exhibitions:`Retrouvez les expositions en cours et passées de la ${siteName}.`,
  publications:`Découvrez les livres et les publications de la ${siteName}.`,
  expertise:`Contactez la ${siteName} pour une demande d’expertise d’une œuvre d’art d’Afrique, d’Océanie ou des Amériques.`,
  contact:`Contactez la ${siteName} pour préparer votre visite ou vous renseigner sur une œuvre.`,
 };
 return descriptions[section];
}
