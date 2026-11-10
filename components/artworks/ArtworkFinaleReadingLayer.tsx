'use client';
import type {ArtworkContent} from './ArtworkInformation';
import {ArtworkInquiryLink} from './ArtworkInformation';
import {ArtworkFinale} from './ArtworkFinale';
import {artworkConclusion} from './ArtworkDocumentContent';
import {artworkDocumentContent} from '../../lib/artworks/document-content';
import {useSiteContent} from '../SiteContentProvider';
import styles from './ArtworkFinale.module.css';
import integration from './ArtworkFinaleScene.module.css';
export function ArtworkFinaleReadingLayer({content,active}:{content:ArtworkContent;active:boolean}){
 const {messages:m}=useSiteContent(),rich=artworkConclusion(content),text=artworkDocumentContent(content);
 return <div className={[styles.scene,integration.readingLayer,integration.persistentReading].join(' ')} data-finale-mobile-reading-layer inert={!active||undefined} aria-hidden={!active}>
  <ArtworkFinale headingComponent="p" title={text.title??m['artwork.untitled']} active={active} metadata={text.artist} previousDetails={<dl>{text.details.map(([key,value])=><div key={key}><dt>{m[key]}</dt><dd>{value}</dd></div>)}</dl>} provenanceLabel="Provenance" provenance={rich.provenance} contact={<ArtworkInquiryLink id={content.artwork.id} locale={content.locale}/>}>{rich.description}</ArtworkFinale>
 </div>;
}
