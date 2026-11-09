"use client";
import {useHeaderMenuMotion} from "./header/useHeaderMenuMotion";
import type {NavigationProjection} from "../lib/navigation/types";
import type {PublicPresentation} from "../lib/presentation/types";
import{useEditorialSurface}from"./editorial/immersive/EditorialInteractionProvider";
import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from "react";
import {HeaderLink} from "./header/HeaderLink";
import type {SiteMessages} from "@/lib/i18n/messages.generated";
import {localizedPath,type Section} from "@/lib/i18n/routes";
import styles from "./SiteHeader.module.css";
import {useSiteContent} from "./SiteContentProvider";
import {useSiteLocale} from "./SiteLocaleBoundary";
const compactQuery="(max-width:1099px)";
const subscribeCompact=(notify:()=>void)=>{const query=matchMedia(compactQuery);query.addEventListener("change",notify);return ()=>query.removeEventListener("change",notify);};
const readCompact=()=>matchMedia(compactQuery).matches;
export interface SiteHeaderProps{navigation?:NavigationProjection;languageCount?:number;galeristNavigation?:PublicPresentation["galeristNavigation"];galeristActive?:boolean;siteName:string;locale:string;defaultLocale:string;messages:SiteMessages;section:Section|null;languageControl?:React.ReactNode;logo?:React.ReactNode;whiteLogo?:React.ReactNode;immersive?:boolean}
export function SiteHeader({navigation,languageCount=2,galeristActive=false,siteName,locale:initialLocale,defaultLocale,messages:initialMessages,section,languageControl,logo,whiteLogo,immersive=false}:SiteHeaderProps){
  const site=useSiteContent(),dynamic=useSiteLocale(),locale=dynamic?site.locale:initialLocale,messages=dynamic?site.messages:initialMessages;
  const menu=dynamic?.translation?.navigation??navigation,links=menu?.items??[],hasCompactContent=links.length>0||languageCount>1;
  const compact=useSyncExternalStore(subscribeCompact,readCompact,()=>false);
  const [phase,setPhase]=useState<"closed"|"open"|"closing">("closed");
  const header=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),controls=useRef<HTMLDivElement>(null);
  useHeaderMenuMotion(header,compact,phase,finishClose);
  const afterClose=useRef<(()=>void)|null>(null);
  const active=hasCompactContent&&compact&&phase!=="closed",open=hasCompactContent&&compact&&phase==="open";
  const [previousCompact,setPreviousCompact]=useState(compact);
  if(previousCompact!==compact){setPreviousCompact(compact);setPhase("closed");}
  useLayoutEffect(()=>{afterClose.current=null;},[compact]);
 useEditorialSurface(active);
  function finishClose(){setPhase("closed");const next=afterClose.current;afterClose.current=null;next?.();}
  function close(next?:()=>void){
    afterClose.current=next??null;
    setPhase("closing");button.current?.focus({preventScroll:true});

  }
  function toggle(){
    if(open){close();return;}
    afterClose.current=null;button.current?.focus({preventScroll:true});setPhase("open");
  }
  function navigate(){
    afterClose.current=null;setPhase("closed");button.current?.focus({preventScroll:true});
  }
  useLayoutEffect(()=>{
    const node=header.current;if(!node)return;
    const measure=()=>{const height=`${node.getBoundingClientRect().height}px`;node.style.setProperty("--site-menu-header-height",height);node.parentElement?.style.setProperty("--site-header-height",height);};
    measure();const observer=new ResizeObserver(measure);observer.observe(node);return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const query=matchMedia(compactQuery);let focused:EventTarget|null=document.activeElement;
    const track=(event:FocusEvent)=>{focused=event.target;};
    const reset=()=>{
      afterClose.current=null;setPhase("closed");
      if(query.matches&&focused instanceof Node&&controls.current?.contains(focused))button.current?.focus();
      else if(!query.matches&&focused===button.current)controls.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    };
    document.addEventListener("focusin",track);query.addEventListener("change",reset);
    return ()=>{document.removeEventListener("focusin",track);query.removeEventListener("change",reset);};
  },[]);
  useEffect(()=>{
    if(!active)return;
    const root=document.documentElement,body=document.body,overflow=root.style.overflow,bodyOverflow=body.style.overflow;
    const background=[...(header.current?.closest("[data-artwork-route]")??document).querySelectorAll<HTMLElement>("main,footer")].map(node=>({node,inert:node.inert}));
    root.style.overflow="hidden";body.style.overflow="hidden";for(const {node}of background)node.inert=true;
    return ()=>{root.style.overflow=overflow;body.style.overflow=bodyOverflow;for(const {node,inert}of background)node.inert=node.id==="contenu"&&node.hasAttribute("data-header-state")?node.getAttribute("data-header-state")!=="ready":inert;};
  },[active]);
  return <><a className="skip" href="#contenu">{messages["header.skipToContent"]}</a><header ref={header} className={`${styles.header} ${immersive?styles.immersive:""}`} data-menu-state={compact?phase:"closed"} data-header-appearance={immersive?"immersive":"standard"} onKeyDown={event=>{
    if(!active)return;
    if(event.key==="Escape"){event.preventDefault();close();}
    if(event.key==="Tab"){
      const targets=[...frame.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]].filter(node=>node.checkVisibility()&&!node.closest("[inert]"));
      const index=targets.indexOf(document.activeElement as HTMLElement);
      if(targets.length){event.preventDefault();targets[(index+(event.shiftKey?-1:1)+targets.length)%targets.length]?.focus();}
    }
  }}>
    <div ref={frame} className={styles.frame} role={active?"dialog":undefined} aria-modal={active?true:undefined} aria-label={active?messages["header.navigationLabel"]:undefined}>
      <div className={styles.menuScrim} data-menu-scrim aria-hidden="true"/>
      <div className={styles.menuSurface} data-menu-surface aria-hidden="true"><div className={styles.menuFill} data-menu-fill/>{["top","bottom","left","right"].map(edge=><span key={edge} className={styles.menuEdge} data-menu-edge={edge}/>)}</div>
      <HeaderLink href={menu?.scope==="preview"?"/preview/render/"+locale:localizedPath("/",locale,defaultLocale)} className={styles.home} onAccepted={navigate} aria-label={messages["header.homeLabel"]+" — "+siteName}><span className={styles.logoStack} aria-hidden="true"><span className={styles.logoVariant} data-logo-tone="dark" data-logo-shared={!whiteLogo||undefined}>{logo??siteName}</span>{whiteLogo&&<span className={styles.logoVariant} data-logo-tone="light">{whiteLogo}</span>}</span></HeaderLink>
      {hasCompactContent&&<button ref={button} type="button" className={styles.toggle} aria-label={messages[open?"header.closeMenu":"header.openMenu"]} aria-expanded={open} aria-controls="site-navigation" onClick={toggle}>
        <span className={styles.menuIcon} data-menu-icon aria-hidden="true"><span/><span/></span>
      </button>}
      <div ref={controls} id="site-navigation" className={styles.controls} inert={compact&&!open||undefined} aria-hidden={compact&&!open||undefined}>
        {links.length>0&&<nav aria-label={messages["header.navigationLabel"]}><ul className={styles.links}>{links.map((item,index)=><li key={item.pageKey} data-menu-content style={{"--menu-item":index} as CSSProperties}><HeaderLink href={item.href} onAccepted={navigate} aria-current={(item.pageKey==="galerist"?galeristActive:section===item.pageKey)?"page":undefined}>{item.pageKey==="galerist"?item.name:messages[`nav.${item.pageKey}`]}</HeaderLink></li>)}</ul></nav>}
        <div className={styles.languageSlot} data-menu-content onClick={event=>{if(open&&(event.target as Element).closest("a"))close();}}>{languageControl}</div>
      </div>
    </div>
  </header></>;
}
