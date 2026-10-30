"use client";
import type {SectionProps} from "./types";
import {ClientArtworkCard as ArtworkCard} from "../components/ClientArtworkCard";
import {EmptySection,Paragraphs,SectionHeading} from "./shared";
import styles from "./Sections.module.css";
export function ArtworkSelection({section,headingLevel}:SectionProps<"artworkSelection">){const p=section.props;return <section id={section.id} className={styles.section}><SectionHeading text={p.heading} level={headingLevel}/><Paragraphs text={p.introduction}/>{p.artworks?.length?<ul className={section.variant==="strip"?styles.strip:styles.grid} tabIndex={section.variant==="strip"?0:undefined} aria-label={p.heading}>{p.artworks.map(art=><ArtworkCard key={art.id} art={art}/>)}</ul>:<EmptySection/>}</section>;}
