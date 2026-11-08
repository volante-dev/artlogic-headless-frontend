"use client";
import Link from "next/link";
import {useSiteContent} from "../SiteContentProvider";
import {Typography} from "../ui/Typography";
import type {PublicContactArtwork} from "../../lib/contact/types";
import styles from "../../sections/Sections.module.css";
import artworkStyles from "./ContactArtworkSection.module.css";
export function ContactFormsIntro({artwork,unavailable,closed}:{artwork:PublicContactArtwork|null;unavailable:boolean;closed:boolean}){
 const {messages:m,locale,defaultLocale}=useSiteContent(),prefix=locale===defaultLocale?"":"/"+locale;
 return <header className={artwork&&!closed?artworkStyles.header:styles.section}><Typography variant="h1">{m["page.contact.title"]}</Typography>{artwork&&<Link className={artworkStyles.general} href={prefix+"/contact"}>{m["contact.general"]}</Link>}{(closed||unavailable)&&<p role="alert">{m[unavailable?"contact.artworkUnavailable":"contact.disabled"]}</p>}{unavailable&&<Link className={styles.link} href={prefix+"/contact"}>{m["contact.general"]}</Link>}</header>;
}
