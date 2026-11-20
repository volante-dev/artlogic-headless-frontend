'use client';
import type {ArtworkContent} from './ArtworkInformation';
import {artworkDocumentContent} from '../../lib/artworks/document-content';
import {RichText} from '../editorial/RichText';
export function artworkConclusion(content:ArtworkContent){
 const text=artworkDocumentContent(content);
 return {description:text.description?<div lang={text.descriptionLocale}><RichText document={text.description}/></div>:null,provenance:text.provenance?<div lang={text.provenanceLocale}><RichText document={text.provenance}/></div>:null};
}
