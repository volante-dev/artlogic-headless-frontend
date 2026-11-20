'use client';
import type {ArtworkContent} from './ArtworkInformation';
import {artworkDocumentContent} from '../../lib/artworks/document-content';
import {RichText} from '../editorial/RichText';
import {ArtworkAvailability} from './ArtworkAvailability';
export function artworkConclusion(content:ArtworkContent){
 const text=artworkDocumentContent(content);
 return {description:text.description||content.availableForSale===true?<>{text.description&&<div lang={text.descriptionLocale}><RichText document={text.description}/></div>}<ArtworkAvailability availableForSale={content.availableForSale} locale={content.locale}/></>:null,provenance:text.provenance?<div lang={text.provenanceLocale}><RichText document={text.provenance}/></div>:null};
}
