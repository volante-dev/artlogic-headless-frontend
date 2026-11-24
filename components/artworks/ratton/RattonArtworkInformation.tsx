"use client";
import type {ReactNode} from "react";
import type {ArtworkContent} from "../ArtworkInformation";
import {artworkDocumentContent} from "../../../lib/artworks/document-content";
import {artworkConclusion} from "../ArtworkDocumentContent";
import {useSiteContent} from "../../SiteContentProvider";
import styles from "./RattonArtwork.module.css";
export function RattonArtworkInformation({content,supplementalContent}:{content:ArtworkContent;supplementalContent?:ReactNode}){
 const {messages}=useSiteContent(),text=artworkDocumentContent(content),rich=artworkConclusion(content);
 return <div className={styles.information} data-artwork-information>
  {text.details.length>0&&<dl>{text.details.map(([key,value])=><div key={key}><dt>{messages[key]}</dt><dd>{value}</dd></div>)}</dl>}
  {content.description&&<div className={styles.description} lang={content.descriptionLocale??content.locale} style={{whiteSpace:"pre-wrap"}}>{content.description}</div>}
  {rich.description&&<section aria-label={messages["gallery.description"]} data-document-description>{rich.description}</section>}
  {rich.provenance&&<section data-document-provenance><h2>Provenance</h2>{rich.provenance}</section>}
  {supplementalContent}
 </div>;
}
