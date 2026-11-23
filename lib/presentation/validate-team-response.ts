import {Ajv2020} from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import {teamSchemas} from "./team-schemas.generated";
import type {TeamExtension} from "./team-types";
const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false});(addFormatsModule as unknown as(a:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});
const publicView=ajv.compile(teamSchemas.OurTeamPublicProjection),previewView=ajv.compile(teamSchemas.OurTeamPreviewProjection),capabilities=ajv.compile(teamSchemas.OurTeamCapabilities);
export function validateTeamCapabilities(value:unknown){if(!capabilities(value))throw new Error("invalid_team_capabilities");return value as {schemaVersion:1;available:boolean;writable:boolean;maxWriteBytes:262144};}
export function validateTeamProjection(value:unknown,expected:{scope:"public"|"preview";id:string;pageKey:string;locale:string}):TeamExtension{
 if(!(expected.scope==="public"?publicView:previewView)(value))throw new Error("invalid_team_projection");
 const data=value as TeamExtension,id="releaseId" in data?data.releaseId:data.snapshotId;
 if(id!==expected.id||data.pageKey!==expected.pageKey||data.locale!==expected.locale)throw new Error("team_identity_changed");
 for(const p of [...(data.section?.founders??[]),...(data.section?.members??[])]){
  const a=p.photo,prefix=(expected.scope==="public"?"/v1/public/presentation-assets/":"/v1/preview/assets/")+a.id;
  if(a.kind!=="image"||!a.path.startsWith(prefix+"?variant=")||!/^w(?:640|1280|1920)$/.test(a.path.slice((prefix+"?variant=").length)))throw new Error("invalid_team_asset_scope");
  for(const v of a.variants??[])if(v.path!==prefix+"?variant="+v.variant)throw new Error("invalid_team_asset_variant");
 }
 const ids=[...(data.section?.founders??[]),...(data.section?.members??[])].map(p=>p.id);if(new Set(ids).size!==ids.length)throw new Error("duplicate_team_person");
 return data;
}
