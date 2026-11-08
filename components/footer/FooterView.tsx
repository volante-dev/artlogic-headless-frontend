"use client";
import type {ReactNode} from "react";
import type {ResolvedFooter} from "../../lib/presentation/types";
import {RichText} from "../editorial/RichText";
import {HeaderLink as FooterLink} from "../header/HeaderLink";
import {FooterGroup} from "./FooterGroup";
import {FooterService} from "./FooterService";
import styles from "../SiteFooter.module.css";
export interface FooterViewProps{footer:ResolvedFooter|null;siteName:string;description:string;logo?:ReactNode;languageControl?:ReactNode;homeHref:string;socialLabel:string}
export function FooterView({footer,siteName,description,logo,homeHref,socialLabel}:FooterViewProps){return <footer className={styles.footer}><div className={styles.panel}>
 {!!footer?.services.length&&<div className={styles.services} style={{gridTemplateColumns:`repeat(${footer.services.length},minmax(0,1fr))`}}>{footer.services.map(s=><FooterService key={s.id} service={s}/>)}</div>}
 {!!(footer?.groups.length||footer?.socialLinks.length||footer?.address)&&<div className={styles.columns} style={{gridTemplateColumns:`repeat(${(footer?.groups.length??0)+(footer?.socialLinks.length?1:0)+(footer?.address?1:0)},minmax(0,1fr))`}}>
 {!!footer?.groups.length&&<nav className={styles.groups} aria-label={siteName} style={{gridColumn:`span ${footer.groups.length}`,gridTemplateColumns:`repeat(${footer.groups.length},minmax(0,1fr))`}}>{footer.groups.map(g=><FooterGroup key={g.id} group={g}/>)}</nav>}
 {footer?.address&&<section className={styles.address} aria-label={footer.locale.startsWith("fr")?"Adresse":"Address"}><h2>{footer.locale.startsWith("fr")?"Adresse":"Address"}</h2><RichText internalLinkComponent={FooterLink} document={footer.address} className={styles.addressText}/></section>}
 {!!footer?.socialLinks.length&&<nav className={styles.socials} aria-label={socialLabel}><h2>{socialLabel}</h2><ul>{footer.socialLinks.map(l=><li key={l.id}><a href={l.destination.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul></nav>}
 </div>}

 <div className={styles.signature}>

 <div className={styles.identity}><FooterLink className={styles.name} href={homeHref} aria-label={siteName}>{logo??siteName}</FooterLink>{description&&(!footer||footer.showDescription)&&<p>{description}</p>}</div>

 </div><p className={styles.copyright}>© {new Date().getFullYear()} {siteName}</p></div></footer>;}
