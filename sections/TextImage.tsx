"use client";
import type {SectionProps} from "./types";
import {Paragraphs,SectionHeading,SectionImage,SectionLink} from "./shared";
import styles from "./Sections.module.css";
export function TextImage({section,headingLevel}:SectionProps<"textImage">){const p=section.props;return <section id={section.id} className={`${styles.section} ${styles.split} ${section.variant==="imageRight"?styles.imageRight:""}`}><SectionImage key={p.image?.id} {...p}/><div><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.body}/><SectionLink link={p.link} label={p.linkLabel}/></div></section>;}
