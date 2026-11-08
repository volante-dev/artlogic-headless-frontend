import {expect,it} from "vitest";
import {parseGalleryExperience} from "../../lib/artworks/validate";
const id="11111111-1111-4111-8111-111111111111",base={scope:"public",artwork:{id,slug:"test-"+id.replaceAll("-",""),title:"Test",artist:null,year:null,medium:null,dimensions:null,media:[]},locale:"fr",description:null,descriptionLocale:null,presentationReleaseId:null,catalogRevision:1};
const doc={type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"Élan, matière et lumière."}]}]};
it("normalizes legacy data and accepts current source data",()=>{
 expect(parseGalleryExperience(base).importedDescription).toBeNull();
 expect(parseGalleryExperience({...base,importedDescription:doc,importedDescriptionLocale:"fr",importedProvenance:doc,importedProvenanceLocale:null}).importedDescription).toEqual(doc);
});
it("rejects incoherent language pairs, unsafe links and malformed rich grammar",()=>{
 for(const extra of [{importedDescription:doc},{importedProvenance:null,importedProvenanceLocale:"fr"},{importedDescription:{type:"script"},importedDescriptionLocale:"fr"},{importedDescription:{type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"x",marks:[{type:"link",attrs:{href:"javascript:alert(1)"}}]}]}]},importedDescriptionLocale:"fr"}])expect(()=>parseGalleryExperience({...base,...extra})).toThrow();
});
