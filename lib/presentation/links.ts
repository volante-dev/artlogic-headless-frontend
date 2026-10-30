import type {PresentationLink} from "./types";
import {localizedPath} from "../i18n/routes";
export function presentationHref(link:PresentationLink,locale:string,defaultLocale:string):string{
  if(link.kind==="page")return localizedPath(link.pageKey==="home"?"/":link.pageKey==="artworkDetail"?"/artworks/"+link.artworkId:"/"+link.pageKey,locale,defaultLocale);
  if(link.kind==="external")return link.url;
  return (link.kind==="email"?"mailto:":"tel:")+link.value;
}
