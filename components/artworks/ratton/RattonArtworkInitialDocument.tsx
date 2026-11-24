"use client";
/* eslint-disable @next/next/no-img-element -- The native reader uses the same authorized sources as the enhanced carousel. */
import {useContext,useId} from "react";
import type {ArtworkContent} from "../ArtworkInformation";
import {ArtworkInquiryLink} from "../ArtworkInformation";
import {ArtworkHeadingContext} from "../ArtworkHeadingContext";
import {useSiteContent} from "../../SiteContentProvider";
import {useMediaDisplayContext} from "../../../lib/media/MediaDisplayProvider";
import {localizedPath} from "../../../lib/i18n/routes";
import {artworkDocumentImage} from "../../../lib/artworks/document-media";
import {rattonArtworkImageSizes} from "../../../lib/artworks/ratton-artwork-image";
import {RattonArtworkInformation} from "./RattonArtworkInformation";
import native from "../ArtworkDocument.module.css";
import styles from "./RattonArtwork.module.css";
export function RattonArtworkInitialDocument({content}:{content:ArtworkContent}){
 const site=useSiteContent(),generated=useId(),heading=useContext(ArtworkHeadingContext)??generated,context=useMediaDisplayContext(),photo=content.artwork.media[0],attributes=photo?artworkDocumentImage(photo,context?.responsive,rattonArtworkImageSizes(photo.width/photo.height)):null;
 return <article className={`${native.reader} ${styles.native}`} data-artwork-readable data-artwork-readable-view="lucas-ratton" aria-labelledby={heading}>
  <a href={localizedPath("/artworks",content.locale,site.defaultLocale)}>{site.messages["page.artworks.title"]}</a>
  <header className={styles.identity}><h1 id={heading}>{content.artwork.title??site.messages["artwork.untitled"]}</h1>{content.artwork.artist&&<p>{content.artwork.artist}</p>}</header>
  {photo&&attributes?<figure><img {...attributes} src={attributes.src} width={photo.width} height={photo.height} alt={photo.alt??content.artwork.title??site.messages["artwork.imageAlt"]} loading="eager" fetchPriority="high"/></figure>:<p>{site.messages["artwork.imageUnavailable"]}</p>}
  <RattonArtworkInformation content={content}/>
  <ArtworkInquiryLink id={content.artwork.id} locale={content.locale}/>
  {content.artwork.media.length>1&&<nav aria-label={site.messages["gallery.progressLabel"]}>{content.artwork.media.slice(1).map((media,index)=><a key={media.id} href={artworkDocumentImage(media,context?.responsive).src}>{site.messages["gallery.view"]} {index+2}</a>)}</nav>}
 </article>;
}
