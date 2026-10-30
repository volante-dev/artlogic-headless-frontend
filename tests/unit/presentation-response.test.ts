import {expect,it} from "vitest";
import {validatePublicPresentation} from "../../lib/presentation/validate-response";
import {publicAssetPath} from "../../lib/presentation/types";
import {manifestFingerprints} from "../../clients/manifests/fingerprints.generated";
import projection from "../../clients/default/projection.json";
import {isTechnicalPath} from "../../lib/i18n/routes";
import {builtinFontPaths} from "../../branding/font-catalog";

const uuid="11111111-1111-4111-8111-111111111111",expected={profileId:"default",locale:"fr",pageKey:"home" as const};
function value(){return {releaseId:uuid,schemaVersion:1,profileId:"default",manifestFingerprint:manifestFingerprints.default,locale:"fr",pageKey:"home",theme:structuredClone(projection),fontFiles:[],sections:[{id:uuid,type:"heroMedia",schemaVersion:1,variant:"immersive",props:{heading:"L’art, au premier regard."}}]};}
it("requires the deployed profile/hash and a closed response without coercion",()=>{
  expect(validatePublicPresentation(value(),expected).releaseId).toBe(uuid);
  for(const input of [{...value(),schemaVersion:"1"},{...value(),storageKey:"secret"},{...value(),manifestFingerprint:"a".repeat(64)},{...value(),profileId:"missing"},{...value(),locale:"en"}])expect(()=>validatePublicPresentation(input,expected)).toThrow();
  const invalid=value();invalid.sections[0].variant="invented";expect(()=>validatePublicPresentation(invalid,expected)).toThrow();expect(invalid.sections[0].variant).toBe("invented");
});
it("rejects a valid preview asset descriptor in a public response and missing font identity",()=>{
  const asset={id:uuid,kind:"image",path:"/v1/preview/assets/"+uuid,mimeType:"image/webp",byteSize:100,width:640,height:360};
  const input=value();Object.assign(input.sections[0].props,{poster:asset});expect(()=>validatePublicPresentation(input,expected)).toThrow("invalid_presentation_asset_scope");
  asset.path="/v1/public/presentation-assets/"+uuid;expect(validatePublicPresentation(input,expected).sections).toHaveLength(1);
  expect(()=>validatePublicPresentation({...value(),fontFiles:[{id:uuid,kind:"font",path:"/v1/public/presentation-assets/"+uuid,mimeType:"font/woff2",byteSize:100}]},expected)).toThrow();
});
it("exempts exactly the installed fonts and valid media routes from locale rewriting",()=>{
  for(const path of builtinFontPaths)expect(isTechnicalPath(path)).toBe(true);
  expect(isTechnicalPath("/presentation-assets/"+uuid)).toBe(true);
  for(const path of ["/fonts/unlisted.woff2","/fonts/catalog.json","/presentation-assets/not-a-uuid","/presentation-assets/"+uuid+"/extra","/en/presentation-assets/"+uuid])expect(isTechnicalPath(path)).toBe(false);
  expect(publicAssetPath("/v1/public/presentation-assets/"+uuid+"?variant=w640")).toBe("/presentation-assets/"+uuid+"?variant=w640");
  for(const path of ["https://storage.invalid/asset","/v1/preview/assets/"+uuid,"/v1/public/presentation-assets/"+uuid+"?token=secret"])expect(()=>publicAssetPath(path)).toThrow();
});
