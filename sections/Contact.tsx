"use client";
import type {SectionProps} from "./types";
import {EmptySection,Paragraphs,SectionHeading,SectionLink} from "./shared";
import styles from "./Sections.module.css";
export function Contact({section,headingLevel}:SectionProps<"contact">){const p=section.props;return <section id={section.id} className={`${styles.section} ${section.variant==="split"?styles.split:styles.narrow}`}><div><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.body}/></div>{p.links?.length?<ul className={styles.contacts}>{p.links.map(link=><li key={link.id}><SectionLink link={link.destination} label={link.label}/></li>)}</ul>:!p.heading&&!p.body?<EmptySection/>:null}</section>;}
