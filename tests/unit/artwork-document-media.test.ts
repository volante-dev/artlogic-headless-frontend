import {describe,it,expect} from 'vitest';import {artworkDocumentImage} from '../../lib/artworks/document-media';
const media={id:'00000000-0000-4000-8000-000000000001',width:1200,height:1800,alt:'Étude',path:'/media/00000000-0000-4000-8000-000000000001'};
describe('native document media',()=>{
 it('keeps the ordinary public URL when responsive delivery is off',()=>{expect(artworkDocumentImage(media)).toEqual({src:'/media/'+media.id,srcSet:undefined,sizes:undefined});});
 it('uses existing bounded candidates when responsive delivery is on',()=>{const value=artworkDocumentImage(media,true);expect(value.src).toContain('?image=r1-reference&v=');expect(value.srcSet).toContain('r1-w640');expect(value.sizes).toContain('100vw');});
 it('falls back without inventing physical dimensions',()=>{expect(artworkDocumentImage({...media,width:0},true).src).toBe('/media/'+media.id);});
});
