import {expect,it} from "vitest";
import {parseGalleryCatalog} from "../../lib/artworks/validate";
it('distinguishes opt-in pages even without items and requires every flag',()=>{
 const empty={items:[],query:'',page:1,pageSize:20,totalItems:0,pageCount:0,catalogRevision:1};
 expect(parseGalleryCatalog(empty)).toEqual(empty);
 expect(()=>parseGalleryCatalog(empty,true)).toThrow();
 const plp={...empty,display:'plp',layout:'grid'};expect(parseGalleryCatalog(plp,true)).toEqual(plp);expect(()=>parseGalleryCatalog(plp)).toThrow();
 expect(()=>parseGalleryCatalog({...plp,layout:'other'},true)).toThrow();
});
