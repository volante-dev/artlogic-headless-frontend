"use client";
import type {SectionProps} from "./types";
import {EmptySection,Paragraphs,SectionHeading,SectionLink} from "./shared";
import styles from "./Sections.module.css";
export function Text({section,headingLevel}:SectionProps<"text">){const p=section.props;return <section id={section.id} className={`${styles.section} ${section.variant==="narrow"?styles.narrow:""}`}><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.body}/><SectionLink link={p.link} label={p.linkLabel}/>{!p.heading&&!p.body&&!p.link&&<EmptySection/>}</section>;}
