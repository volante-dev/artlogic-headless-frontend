"use client";
import type {SectionProps} from "./types";
import {Typography} from "../components/ui/Typography";
import {Link} from "../components/ui/Link";
import {useSiteContent} from "../components/SiteContentProvider";
import {presentationHref} from "../lib/presentation/links";
import {EmptySection,Paragraphs,SectionHeading,SectionImage} from "./shared";
import styles from "./Sections.module.css";
export function EditorialCards({section,headingLevel}:SectionProps<"editorialCards">){const p=section.props,{locale,defaultLocale,messages}=useSiteContent();return <section id={section.id} className={styles.section}><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.introduction}/>{p.items?.length?<ul className={section.variant==="list"?styles.list:styles.grid}>{p.items.map(item=><li key={item.id} className={styles.editorial}>{item.image&&<SectionImage key={item.image.id} {...item}/>}<div><Typography variant="h3">{item.link?<Link href={presentationHref(item.link,locale,defaultLocale)}>{item.heading||messages["presentation.readMore"]}</Link>:item.heading}</Typography><Paragraphs text={item.excerpt}/></div></li>)}</ul>:<EmptySection/>}</section>;}
