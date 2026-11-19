"use client";
import {sectionImageSizes} from "../lib/media/public-image-sizes";
import type {SectionProps} from "./types";
import {useSiteContent} from "../components/SiteContentProvider";
import {EmptySection,SectionHeading,SectionImage} from "./shared";
import styles from "./Sections.module.css";
export function ImageGallery({section,headingLevel}:SectionProps<"imageGallery">){const p=section.props,{messages}=useSiteContent();return <section id={section.id} className={styles.section}><SectionHeading text={p.heading} level={headingLevel}/>{p.items?.length?<ul className={section.variant==="strip"?styles.strip:styles.grid} tabIndex={section.variant==="strip"?0:undefined} aria-label={p.heading||messages["presentation.galleryLabel"]}>{p.items.map(item=><li key={item.id}><SectionImage key={item.image?.id} {...item} sizes={sectionImageSizes((item.image?.width??1)/(item.image?.height??1),section.variant==="strip"?"strip":"grid")}/></li>)}</ul>:<EmptySection/>}</section>;}
