import {Ajv2020} from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import {presentationSchemas} from "../../page-composer/schemas.generated";
import {manifestFingerprints} from "../../clients/manifests/fingerprints.generated";
import type {PublicPresentation,PageKey} from "./types";
import type {components} from "../api/generated";

const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false,allErrors:false});
(addFormatsModule as unknown as (value:Ajv2020)=>void)(ajv);
ajv.addKeyword({keyword:"example",valid:true});
const validate=ajv.compile(presentationSchemas.PresentationPublic);
const validatePreview=ajv.compile(presentationSchemas.PresentationPreview);
export function validatePreviewPresentation(value:unknown,expected:{profileId:string;locale:string;pageKey:PageKey}):components["schemas"]["PresentationPreview"]{
  if(!validatePreview(value))throw new Error("invalid_preview_response");
  const data=value as components["schemas"]["PresentationPreview"];
  assertIdentity(data,expected);assetScope(data,"/v1/preview/assets/");return data;
}
function assertIdentity(data:{profileId:string;manifestFingerprint:string;locale:string;pageKey:PageKey},expected:{profileId:string;locale:string;pageKey:PageKey}){
 const fingerprint=manifestFingerprints[expected.profileId as keyof typeof manifestFingerprints];
 if(!fingerprint||data.profileId!==expected.profileId||data.manifestFingerprint!==fingerprint||data.locale!==expected.locale||data.pageKey!==expected.pageKey)throw new Error("presentation_configuration_mismatch");
}
function assetScope(value:unknown,base:string):void{
 if(Array.isArray(value)){value.forEach(v=>assetScope(v,base));return;}
 if(value&&typeof value==="object"){
  const record=value as Record<string,unknown>;
  if(["image","video","font"].includes(String(record.kind))){const prefix=base+record.id;if(typeof record.path!=="string"||record.path!==prefix&&!record.path.startsWith(prefix+"?variant="))throw new Error("invalid_presentation_asset_scope");if(Array.isArray(record.variants))for(const variant of record.variants)if(variant.path!==prefix+"?variant="+variant.variant)throw new Error("invalid_presentation_asset_variant");}
  Object.values(record).forEach(v=>assetScope(v,base));
 }
}
export function validatePublicPresentation(value:unknown,expected:{profileId:string;locale:string;pageKey:PageKey}):PublicPresentation{
  if(!validate(value))throw new Error("invalid_presentation_response");
  const data=value as PublicPresentation,fingerprint=manifestFingerprints[expected.profileId as keyof typeof manifestFingerprints];
  if(!fingerprint||data.profileId!==expected.profileId||data.manifestFingerprint!==fingerprint||data.locale!==expected.locale||data.pageKey!==expected.pageKey)throw new Error("presentation_configuration_mismatch");
  function scope(value:unknown):void{
    if(Array.isArray(value)){value.forEach(scope);return;}
    if(value&&typeof value==="object"){
      const record=value as Record<string,unknown>;
      if(["image","video","font"].includes(String(record.kind))){
        const prefix="/v1/public/presentation-assets/"+record.id;
        if(typeof record.path!=="string"||record.path!==prefix&&!record.path.startsWith(prefix+"?variant="))throw new Error("invalid_presentation_asset_scope");
        if(Array.isArray(record.variants))for(const variant of record.variants)if(variant.path!==prefix+"?variant="+variant.variant)throw new Error("invalid_presentation_asset_variant");
      }
      Object.values(record).forEach(scope);
    }
  }
  scope(data);return data;
}
