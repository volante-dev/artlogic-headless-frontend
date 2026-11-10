'use client';
/* eslint-disable @next/next/no-img-element -- Public native URLs preserve the existing media authorization and srcset policy. */
import {useMediaDisplayContext} from '../../lib/media/MediaDisplayProvider';
import {useContext,useId} from 'react';
import type {ArtworkContent} from './ArtworkInformation';
import {ArtworkHeadingContext} from './ArtworkHeadingContext';
import {useSiteContent} from '../SiteContentProvider';
import {localizedPath} from '../../lib/i18n/routes';
import {artworkDocumentContent} from '../../lib/artworks/document-content';
import {artworkDocumentImage} from '../../lib/artworks/document-media';
import {artworkConclusion} from './ArtworkDocumentContent';
import styles from './ArtworkDocument.module.css';
export function ArtworkInitialDocument({content}:{content:ArtworkContent}){
 const mediaContext=useMediaDisplayContext();
 const site=useSiteContent(),generated=useId(),heading=useContext(ArtworkHeadingContext)??generated,text=artworkDocumentContent(content),rich=artworkConclusion(content),art=content.artwork;
 return <article className={styles.reader} data-artwork-readable aria-labelledby={heading}>
  <a href={localizedPath('/artworks',content.locale,site.defaultLocale)}>{site.messages['page.artworks.title']}</a>
  <h1 id={heading}>{text.title??site.messages['artwork.untitled']}</h1>{text.artist&&<p>{text.artist}</p>}
  {content.description&&<p lang={content.descriptionLocale??content.locale} style={{whiteSpace:'pre-wrap'}}>{content.description}</p>}
  {text.details.length>0&&<dl>{text.details.map(([key,value])=><div key={key}><dt>{site.messages[key]}</dt><dd>{value}</dd></div>)}</dl>}
  {art.media.map((media,index)=>{const attributes=artworkDocumentImage(media,mediaContext?.responsive);return <figure key={media.id}><img {...attributes} src={attributes.src} width={media.width} height={media.height} alt={media.alt??text.title??site.messages['artwork.imageAlt']} loading="lazy" fetchPriority={index===0?'high':undefined}/></figure>;})}
  {rich.description&&<section data-document-description>{rich.description}</section>}
  {rich.provenance&&<section data-document-provenance><h2>Provenance</h2>{rich.provenance}</section>}
  <a href={localizedPath('/contact',content.locale,site.defaultLocale)+'?artwork='+art.id}>{site.messages['contact.artworkCta']}</a>
 </article>;
}
