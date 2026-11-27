"use client";
import {useRuntimeText} from "../../lib/i18n/use-runtime-text";
import type {ReactNode} from "react";
import type {ResolvedFooter} from "../../lib/presentation/types";
import {RichText} from "../editorial/RichText";
import {HeaderLink as FooterLink} from "../header/HeaderLink";
import {FooterGroup} from "./FooterGroup";
import {FooterService} from "./FooterService";
import styles from "../SiteFooter.module.css";
export interface FooterViewProps{privacyControl?:ReactNode;extraLinks?:readonly {href:string;label:string}[];footer:ResolvedFooter|null;siteName:string;description:string;logo?:ReactNode;languageControl?:ReactNode;homeHref:string;socialLabel:string;legalHref?:string;legalLabel?:string}
export function FooterView({footer,siteName,description,logo,homeHref,socialLabel,legalHref,legalLabel,extraLinks,privacyControl}:FooterViewProps){const text=useRuntimeText(footer?.locale);return <footer className={styles.footer}><div className={styles.panel}>
 {!!footer?.services.length&&<div className={styles.services} style={{gridTemplateColumns:`repeat(${footer.services.length},minmax(0,1fr))`}}>{footer.services.map(s=><FooterService key={s.id} service={s}/>)}</div>}
 {!!(footer?.groups.length||footer?.socialLinks.length||footer?.address)&&<div className={styles.columns} style={{gridTemplateColumns:`repeat(${(footer?.groups.length??0)+(footer?.socialLinks.length?1:0)+(footer?.address?1:0)},minmax(0,1fr))`}}>
 {!!footer?.groups.length&&<nav className={styles.groups} aria-label={siteName} style={{gridColumn:`span ${footer.groups.length}`,gridTemplateColumns:`repeat(${footer.groups.length},minmax(0,1fr))`}}>{footer.groups.map(g=><FooterGroup key={g.id} group={g}/>)}</nav>}
 {footer?.address&&<section className={styles.address} aria-label={text("ui.0ff425451edbbf9b")}><h2>{text("ui.6695ea63811388d0")}</h2><RichText internalLinkComponent={FooterLink} document={footer.address} className={styles.addressText}/></section>}
 {!!footer?.socialLinks.length&&<nav className={styles.socials} aria-label={socialLabel}><h2>{socialLabel}</h2><ul>{footer.socialLinks.map(l=><li key={l.id}><a href={l.destination.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul></nav>}
 </div>}

 <div className={styles.signature}>

 <div className={styles.identity}><FooterLink className={styles.name} href={homeHref} aria-label={siteName}>{logo??siteName}</FooterLink>{description&&(!footer||footer.showDescription)&&<p>{description}</p>}</div>

 </div><div className={styles.copyright}><p>© {new Date().getFullYear()} {siteName}{legalHref&&<> · <FooterLink href={legalHref}>{legalLabel}</FooterLink></>}{extraLinks?.map(link=><span key={link.href}> · <FooterLink href={link.href}>{link.label}</FooterLink></span>)}{privacyControl&&<> · {privacyControl}</>}</p>{footer?.credit&&<RichText internalLinkComponent={FooterLink} document={footer.credit} className={styles.credit}/>}</div></div></footer>;}
