"use client";
import {useEffect,useRef} from "react";
import {HeaderLink as FooterLink} from "../header/HeaderLink";
import type {ResolvedFooter} from "../../lib/presentation/types";
import styles from "../SiteFooter.module.css";
export function FooterGroup({group}:{group:ResolvedFooter["groups"][number]}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const media=matchMedia("(max-width:767px)");const change=()=>{const el=ref.current;if(!el)return;const focused=el.contains(document.activeElement);el.open=!media.matches;const summary=el.querySelector("summary");if(summary)summary.tabIndex=media.matches?0:-1;if(media.matches&&focused)el.querySelector("summary")?.focus();};change();media.addEventListener("change",change);return()=>media.removeEventListener("change",change);},[]);
 return <details ref={ref} open className={styles.group} onToggle={e=>{if(!matchMedia("(max-width:767px)").matches)e.currentTarget.open=true;}}><summary><h2>{group.title}</h2><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M8 2v12" stroke="currentColor"/></svg></summary><ul>{group.links.map(link=><li key={link.id}><FooterLink href={link.destination.href}>{link.label}</FooterLink></li>)}</ul></details>;
}
