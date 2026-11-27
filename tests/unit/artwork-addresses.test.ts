import {it,expect} from 'vitest';
import {parseArtworkAddressSet,parseArtworkAddressResolution} from '../../lib/artworks/addresses';
import {artworkHref} from '../../lib/artworks/artwork-href';
const id='11111111-1111-4111-8111-111111111111',legacy='masque-'+id.replaceAll('-','');
const address={artworkId:id,locale:'fr',slug:'masque',canonicalPath:'/artworks/masque',alternates:[{locale:'en',slug:'mask',path:'/en/artworks/mask'}]};
const set={schemaVersion:1,mode:'active',addressRevision:'2',contextRevision:'ctx.1',items:[address]};
it('uses validated effective addresses and keeps legacy fallback explicit',()=>{
 const parsed=parseArtworkAddressSet(set);expect(artworkHref({id,slug:legacy,publicAddress:parsed.items[0]},'fr','fr')).toBe('/artworks/masque');expect(artworkHref({id,slug:legacy,publicAddress:parsed.items[0]},'en','fr')).toBe('/en/artworks/mask');
 expect(artworkHref({id,slug:legacy},'en','fr')).toBe('/en/artworks/'+legacy);
});
it('rejects invalid namespaces, private keys, identity drift and foreign paths',()=>{
 for(const change of [{slug:'x'.repeat(81)},{slug:legacy},{artworkId:'bad'},{canonicalPath:'https://evil.example/'},{privateTitle:'PRIVATE'}])expect(()=>parseArtworkAddressSet({...set,items:[{...address,...change}]})).toThrow();
 expect(()=>parseArtworkAddressSet({...set,items:[address,address]})).toThrow();
 expect(()=>parseArtworkAddressSet({...set,items:[{...address,alternates:[{locale:'en',slug:'mask',path:'/en/artworks/another'}]}]})).toThrow();
});
it('distinguishes permanent canonicalization from temporary language fallback',()=>{
 const raw={schemaVersion:1,mode:'active',addressRevision:'2',contextRevision:'ctx.1',address,requestedLocale:'fr',decision:'canonical_redirect',redirect:true,redirectStatus:308};
 expect(parseArtworkAddressResolution(raw).redirectStatus).toBe(308);
 expect(()=>parseArtworkAddressResolution({...raw,decision:'locale_fallback'})).toThrow();
});
