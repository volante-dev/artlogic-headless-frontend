"use client";
import {useSiteContent} from "../SiteContentProvider";
import {localizedPath} from "../../lib/i18n/routes";
import {useArtworkNavigation} from "./ArtworkNavigationContext";
import styles from "./ArtworkDialogShell.module.css";
import {useSiteLocale} from "../SiteLocaleBoundary";
export function ArtworkLanguageSelector({artworkRef,locale}:{artworkRef:string;locale:string}){
  const {locales,defaultLocale,messages}=useSiteContent(),navigation=useArtworkNavigation(),dynamic=useSiteLocale();
  return <nav data-control-surface="light" className={styles.languages} aria-label={messages["header.languageLabel"]} aria-busy={dynamic?.pending||undefined}>
    {locales.map(code=><a key={code} data-artwork-locale={code} href={localizedPath("/artworks/"+artworkRef,code,defaultLocale)} lang={code} hrefLang={code} aria-current={code===locale?"page":undefined} onClick={event=>{
      if(navigation&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&event.button===0){event.preventDefault();if(code!==locale)navigation.changeLocale(code);}
    }}>{code.toUpperCase()}</a>)}
    {dynamic?.error&&<span role="status">{messages["catalog.errorMessage"]}</span>}
  </nav>;
}
