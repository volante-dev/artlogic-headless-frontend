"use client";
import {useEffect,useRef,useState} from "react";
import {FreshLink} from "./FreshLink";
import type {SiteMessages} from "@/lib/i18n/messages.generated";
import {localizedPath,sections,type Section} from "@/lib/i18n/routes";
import styles from "./SiteHeader.module.css";
import {Button} from "./ui/Button";
import {useSiteContent} from "./SiteContentProvider";
import {useSiteLocale} from "./SiteLocaleBoundary";
export interface SiteHeaderProps{siteName:string;locale:string;defaultLocale:string;messages:SiteMessages;section:Section|null;languageControl?:React.ReactNode;logo?:React.ReactNode;immersive?:boolean}
export function SiteHeader({siteName,locale:initialLocale,defaultLocale,messages:initialMessages,section,languageControl,logo,immersive=false}:SiteHeaderProps){
  const site=useSiteContent(),dynamic=useSiteLocale(),locale=dynamic?site.locale:initialLocale,messages=dynamic?site.messages:initialMessages;
  const [open,setOpen]=useState(false),button=useRef<HTMLButtonElement>(null),controls=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const query=window.matchMedia("(min-width: 1100px)");let focused:EventTarget|null=document.activeElement;
    const track=(event:FocusEvent)=>{focused=event.target;};
    const reset=()=>{setOpen(false);if(!query.matches&&focused instanceof Node&&controls.current?.contains(focused))button.current?.focus();else if(query.matches&&focused===button.current)controls.current?.querySelector<HTMLAnchorElement>("a")?.focus();};
    document.addEventListener("focusin",track);query.addEventListener("change",reset);
    return ()=>{document.removeEventListener("focusin",track);query.removeEventListener("change",reset);};
  },[]);
  function close(){setOpen(false);}
  return <><a className="skip" href="#contenu">{messages["header.skipToContent"]}</a><header className={`${styles.header} ${immersive?styles.immersive:""}`} onKeyDown={event=>{if(event.key==="Escape"&&open){event.preventDefault();close();button.current?.focus();}}}>
    <FreshLink href={localizedPath("/",locale,defaultLocale)} className={styles.home} aria-label={messages["header.homeLabel"]+" — "+siteName}>{logo??siteName}</FreshLink>
    <Button ref={button} variant="outlined" type="button" className={styles.toggle} aria-expanded={open} aria-controls="site-navigation" onClick={()=>setOpen(!open)}>{messages[open?"header.closeMenu":"header.openMenu"]}</Button>
    <div ref={controls} id="site-navigation" className={`${styles.controls} ${open?styles.open:""}`} onClick={event=>{if((event.target as Element).closest("a"))close();}}>
      <nav aria-label={messages["header.navigationLabel"]}><ul className={styles.links}>{sections.map(item=><li key={item}><FreshLink href={localizedPath("/"+item,locale,defaultLocale)} aria-current={section===item?"page":undefined}>{messages[`nav.${item}`]}</FreshLink></li>)}</ul></nav>
      {languageControl}
    </div>
  </header></>;
}
