"use client";
import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore,type MouseEvent,type CSSProperties} from "react";
import {FreshLink} from "./FreshLink";
import type {SiteMessages} from "@/lib/i18n/messages.generated";
import {localizedPath,sections,type Section} from "@/lib/i18n/routes";
import styles from "./SiteHeader.module.css";
import {useSiteContent} from "./SiteContentProvider";
import {useSiteLocale} from "./SiteLocaleBoundary";
const compactQuery="(max-width:1099px)";
const subscribeCompact=(notify:()=>void)=>{const query=matchMedia(compactQuery);query.addEventListener("change",notify);return ()=>query.removeEventListener("change",notify);};
const readCompact=()=>matchMedia(compactQuery).matches;
export interface SiteHeaderProps{siteName:string;locale:string;defaultLocale:string;messages:SiteMessages;section:Section|null;languageControl?:React.ReactNode;logo?:React.ReactNode;immersive?:boolean}
export function SiteHeader({siteName,locale:initialLocale,defaultLocale,messages:initialMessages,section,languageControl,logo,immersive=false}:SiteHeaderProps){
  const site=useSiteContent(),dynamic=useSiteLocale(),locale=dynamic?site.locale:initialLocale,messages=dynamic?site.messages:initialMessages;
  const compact=useSyncExternalStore(subscribeCompact,readCompact,()=>false);
  const [phase,setPhase]=useState<"closed"|"open"|"closing">("closed");
  const header=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),controls=useRef<HTMLDivElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null),afterClose=useRef<(()=>void)|null>(null);
  const active=compact&&phase!=="closed",open=compact&&phase==="open";
  function finishClose(){timer.current=null;setPhase("closed");const next=afterClose.current;afterClose.current=null;next?.();}
  function close(next?:()=>void){
    if(timer.current)clearTimeout(timer.current);afterClose.current=next??null;
    setPhase("closing");button.current?.focus({preventScroll:true});
    timer.current=setTimeout(finishClose,matchMedia("(prefers-reduced-motion:reduce)").matches?120:360);
  }
  function toggle(){
    if(open){close();return;}
    if(timer.current)clearTimeout(timer.current);timer.current=null;afterClose.current=null;button.current?.focus({preventScroll:true});setPhase("open");
  }
  function navigate(event:MouseEvent<HTMLAnchorElement>){
    if(!open||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||event.currentTarget.target&&event.currentTarget.target!=="_self")return;
    event.preventDefault();const href=event.currentTarget.href;close(()=>window.location.assign(href));
  }
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  useLayoutEffect(()=>{
    const node=header.current;if(!node)return;
    const measure=()=>node.style.setProperty("--site-menu-header-height",`${node.getBoundingClientRect().height}px`);
    measure();const observer=new ResizeObserver(measure);observer.observe(node);return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const query=matchMedia(compactQuery);let focused:EventTarget|null=document.activeElement;
    const track=(event:FocusEvent)=>{focused=event.target;};
    const reset=()=>{
      if(timer.current)clearTimeout(timer.current);timer.current=null;afterClose.current=null;setPhase("closed");
      if(query.matches&&focused instanceof Node&&controls.current?.contains(focused))button.current?.focus();
      else if(!query.matches&&focused===button.current)controls.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    };
    document.addEventListener("focusin",track);query.addEventListener("change",reset);
    return ()=>{document.removeEventListener("focusin",track);query.removeEventListener("change",reset);};
  },[]);
  useEffect(()=>{
    if(!active)return;
    const root=document.documentElement,body=document.body,overflow=root.style.overflow,bodyOverflow=body.style.overflow;
    const background=[...document.querySelectorAll<HTMLElement>("main,footer")].map(node=>({node,inert:node.inert}));
    root.style.overflow="hidden";body.style.overflow="hidden";for(const {node}of background)node.inert=true;
    return ()=>{root.style.overflow=overflow;body.style.overflow=bodyOverflow;for(const {node,inert}of background)node.inert=inert;};
  },[active]);
  return <><a className="skip" href="#contenu">{messages["header.skipToContent"]}</a><header ref={header} className={`${styles.header} ${immersive?styles.immersive:""}`} data-menu-state={compact?phase:"closed"} onKeyDown={event=>{
    if(!active)return;
    if(event.key==="Escape"){event.preventDefault();close();}
    if(event.key==="Tab"){
      const targets=[...frame.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]].filter(node=>node.checkVisibility()&&!node.closest("[inert]"));
      const index=targets.indexOf(document.activeElement as HTMLElement);
      if(targets.length){event.preventDefault();targets[(index+(event.shiftKey?-1:1)+targets.length)%targets.length]?.focus();}
    }
  }}>
    <div ref={frame} className={styles.frame} role={active?"dialog":undefined} aria-modal={active?true:undefined} aria-label={active?messages["header.navigationLabel"]:undefined}>
      <div className={styles.menuSurface} aria-hidden="true"/>
      <FreshLink href={localizedPath("/",locale,defaultLocale)} className={styles.home} onClickCapture={navigate} aria-label={messages["header.homeLabel"]+" — "+siteName}>{logo??siteName}</FreshLink>
      <button ref={button} type="button" className={styles.toggle} aria-label={messages[open?"header.closeMenu":"header.openMenu"]} aria-expanded={open} aria-controls="site-navigation" onClick={toggle}>
        <span className={styles.menuIcon} aria-hidden="true"><span/><span/></span>
      </button>
      <div ref={controls} id="site-navigation" className={styles.controls} inert={compact&&!open||undefined} aria-hidden={compact&&!open||undefined}>
        <nav aria-label={messages["header.navigationLabel"]}><ul className={styles.links}>{sections.map((item,index)=><li key={item} style={{"--menu-item":index} as CSSProperties}><FreshLink href={localizedPath("/"+item,locale,defaultLocale)} onClickCapture={navigate} aria-current={section===item?"page":undefined}>{messages[`nav.${item}`]}</FreshLink></li>)}</ul></nav>
        <div className={styles.languageSlot} onClick={event=>{if(open&&(event.target as Element).closest("a"))close();}}>{languageControl}</div>
      </div>
    </div>
  </header></>;
}
