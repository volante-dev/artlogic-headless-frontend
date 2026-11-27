"use client";
import {useSiteContent} from "../SiteContentProvider";
import {artworkHref} from "../../lib/artworks/artwork-href";
import type {ArtworkAddress} from "../../lib/artworks/addresses";
import {localizedPath} from "../../lib/i18n/routes";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import styles from "./ArtworkDialogShell.module.css";
import {useSiteLocale} from "../SiteLocaleBoundary";
export function ArtworkLanguageSelector({artworkRef,locale,publicAddress}:{artworkRef:string;locale:string;publicAddress?:ArtworkAddress}){
  const {locales,defaultLocale,messages}=useSiteContent(),navigation=useArtworkNavigation(),dynamic=useSiteLocale();
  const candidate=dynamic?.translation?.artwork?.artwork.publicAddress??publicAddress??navigation?.publicAddress,address=candidate&&(candidate.artworkId===artworkRef||candidate.slug===artworkRef||candidate.alternates.some(a=>a.slug===artworkRef))?candidate:undefined;
  return <nav data-control-surface="light" className={styles.languages} aria-label={messages["header.languageLabel"]} aria-busy={dynamic?.pending||undefined}>
    {locales.filter(code=>!address||address.locale===code||address.alternates.some(a=>a.locale===code)).map(code=><a key={code} data-artwork-locale={code} href={address?artworkHref({id:address.artworkId,publicAddress:address},code,defaultLocale):localizedPath("/artworks/"+artworkRef,code,defaultLocale)} lang={code} hrefLang={code} aria-current={code===locale?"page":undefined} onClick={event=>{
      if(navigation&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&event.button===0){event.preventDefault();if(code!==locale)navigation.changeLocale(code);}
    }}>{code.toUpperCase()}</a>)}
    {dynamic?.error&&<span role="status">{messages["catalog.errorMessage"]}</span>}
  </nav>;
}
