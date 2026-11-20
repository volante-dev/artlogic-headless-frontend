import {Ajv2020} from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type {ValidateFunction} from 'ajv';
import {linkInBioSchemas} from './schemas.generated';
import type {components} from './contract-types.generated';
export type Schemas=components['schemas'];
type Name=keyof typeof linkInBioSchemas;
const ajv=new Ajv2020({strict:true,allErrors:false,removeAdditional:false});
(addFormats as unknown as (a:Ajv2020)=>void)(ajv);
const validators=new Map<Name,ValidateFunction>();
export function decodeLinkInBio<K extends Name>(name:K,value:unknown):Schemas[K]{let validate=validators.get(name);if(!validate){validate=ajv.compile(structuredClone(linkInBioSchemas[name]));validators.set(name,validate);}if(!validate(value))throw new Error('link_in_bio_contract_invalid');return value as Schemas[K];}
export class LinkInBioError extends Error {constructor(readonly status:number,readonly code:string,readonly details:readonly {field:string;reason:string}[]=[],message='Link in bio indisponible',readonly retryAfterSeconds?:number){super(message);}}
export function readLinkInBioError(status:number,value:unknown,retryAfterSeconds?:number){try{const parsed=decodeLinkInBio('LibError',value);return new LinkInBioError(status,parsed.error.code,parsed.error.details,parsed.error.message,retryAfterSeconds);}catch{return new LinkInBioError(status,'dependency_unavailable',[],undefined,retryAfterSeconds);}}
