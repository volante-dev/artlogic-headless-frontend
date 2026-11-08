import {expect,it} from "vitest";
import {parseGalleryExperience,parseGalleryPreviewExperience} from "../../lib/artworks/validate";
const id="11111111-1111-4111-8111-111111111111",media="22222222-2222-4222-8222-222222222222";
const artwork={id,slug:"test-"+id.replaceAll("-",""),title:"Test",artist:null,year:null,medium:null,dimensions:null,media:[{id:media,path:"/v1/public/media/"+media,alt:null,width:1200,height:800}]};
const base={scope:"public",artwork,locale:"fr",description:null,descriptionLocale:null,presentationReleaseId:null,catalogRevision:1};
it("accepts old and new experience responses without enriching shared artwork data",()=>{
 expect(parseGalleryExperience(base).heroFocus).toBeNull();
 const heroFocus={mediaId:media,x:.75,y:.2};expect(parseGalleryExperience({...base,heroFocus}).heroFocus).toEqual(heroFocus);
 expect(parseGalleryExperience({...base,heroFocus:null}).heroFocus).toBeNull();
 const rest={artwork,locale:"fr",description:null,descriptionLocale:null,catalogRevision:1};
 expect(parseGalleryPreviewExperience({...rest,scope:"preview",snapshotId:id,revision:"1",heroFocus}).heroFocus).toEqual(heroFocus);
});
it("rejects out of bounds, unknown fields and focus on a secondary or foreign media",()=>{
 for(const heroFocus of [{mediaId:id,x:.5,y:.5},{mediaId:media,x:2,y:0},{mediaId:media,x:"0.5",y:0},{mediaId:media,x:.5,y:0,extra:1}])expect(()=>parseGalleryExperience({...base,heroFocus})).toThrow();
 expect(()=>parseGalleryExperience({...base,unexpected:true})).toThrow();
});
