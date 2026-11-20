import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseGalleryExperience,parseGalleryPreviewExperience} from '../../lib/artworks/validate';
import {ArtworkAvailability} from '../../components/artworks/ArtworkAvailability';
import {artworkConclusion} from '../../components/artworks/ArtworkDocumentContent';
const id='50000000-0000-4000-8000-000000000001';
const legacy={scope:'public',artwork:{id,slug:'synthetic-'+id.replaceAll('-',''),title:'Synthetic',artist:null,year:null,medium:null,dimensions:null,media:[]},locale:'fr',description:null,descriptionLocale:null,presentationReleaseId:null,catalogRevision:1};
describe('optional sale availability',()=>{
 it('accepts the preceding API response with no availability claim',()=>{
  const parsed=parseGalleryExperience(legacy);expect(parsed.availableForSale).toBeUndefined();expect(artworkConclusion(parsed).description).toBeNull();
 });
 it.each([true,false,null])('accepts public and preview values %j',availableForSale=>{
  expect(parseGalleryExperience({...legacy,availableForSale}).availableForSale).toBe(availableForSale);
  const {presentationReleaseId,...rest}=legacy;void presentationReleaseId;
  expect(parseGalleryPreviewExperience({...rest,scope:'preview',snapshotId:id,revision:'1',availableForSale}).availableForSale).toBe(availableForSale);
 });
 it.each(['true',1,{},[]])('rejects malformed claims %j',availableForSale=>expect(()=>parseGalleryExperience({...legacy,availableForSale})).toThrow('invalid_gallery_response'));
 it.each([undefined,null,false])('renders no indicator for %j',availableForSale=>expect(renderToStaticMarkup(createElement(ArtworkAvailability,{availableForSale,locale:'fr'}))).toBe(''));
 it('renders a localized accessible label with a decorative dot',()=>{
  const fr=renderToStaticMarkup(createElement(ArtworkAvailability,{availableForSale:true,locale:'fr'}));
  expect(fr).toContain('<strong>DISPONIBLE</strong>');expect(fr).toContain('aria-hidden="true"');
  expect(renderToStaticMarkup(createElement(ArtworkAvailability,{availableForSale:true,locale:'en'}))).toContain('<strong>AVAILABLE</strong>');
 });
 it('appends availability after imported description, including when text is absent',()=>{
  const content={...parseGalleryExperience({...legacy,availableForSale:true}),importedDescription:{type:'doc' as const,content:[{type:'paragraph' as const,content:[{type:'text' as const,text:'Description finale synthétique'}]}]}};
  const html=renderToStaticMarkup(artworkConclusion(content).description);
  expect(html.indexOf('DISPONIBLE')).toBeGreaterThan(html.indexOf('Description finale synthétique'));
  expect(renderToStaticMarkup(artworkConclusion({...content,importedDescription:null}).description)).toContain('DISPONIBLE');
 });
});
