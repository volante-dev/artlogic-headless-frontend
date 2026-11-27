import type {SiteMessages as LegacySiteMessages,MessageKey} from './messages.generated';
import {runtimeMessageDefinitions} from './message-definitions.generated';
import {legacyRuntimeMessageInitialValues} from './legacy-runtime-initials.generated';
import {formatLanguageMessage,requiredPluralVariants,type LanguageMessageDefinition} from './runtime-messages';
import {RuntimeContentError} from './runtime-content';
export {messageRegistry,initialMessages} from './messages.generated';
export type {MessageKey} from './messages.generated';
type Definition=typeof runtimeMessageDefinitions[number];
export type RuntimeMessageId=Definition['id'];
type CoreKey=Extract<MessageKey,Extract<Definition,{module:'core'}>['id']>;
/** Core text is mandatory; a closed optional module has no fabricated message values. */
export type SiteMessages=Pick<LegacySiteMessages,CoreKey>&Partial<LegacySiteMessages>&Partial<Record<RuntimeMessageId,string>>;
export interface RuntimeCatalogueContext{catalogueId:string;publicRevision:string;contentRevision:string;modules:readonly string[]}
const definitions:readonly LanguageMessageDefinition[]=runtimeMessageDefinitions;
const byId=new Map(definitions.map(definition=>[definition.id,definition]));
export function runtimeText(messages:Readonly<Record<string,string|undefined>>,locale:string,id:RuntimeMessageId,parameters:Readonly<Record<string,unknown>>={}):string{
 const definition=byId.get(id);if(!definition)throw new RuntimeContentError();
 const keys=definition.pluralParameter?requiredPluralVariants(locale).map(variant=>id+'.'+variant):[id],values:Record<string,string>={};
 for(const key of keys){const value=messages[key];if(typeof value!=='string')throw new RuntimeContentError();values[key]=value;}
 return formatLanguageMessage(definition,values,locale,parameters);
}
/** Only an explicitly older catalogue may use compiled text in that exact supported locale. */
export function legacyRuntimeMessages(messages:LegacySiteMessages,locale:string):SiteMessages{
 const values:Readonly<Record<string,Readonly<Record<string,string>>>>=legacyRuntimeMessageInitialValues,initial=values[locale];if(!initial)throw new RuntimeContentError();return {...initial,...messages};
}
export function hasRuntimeModule(messages:Readonly<Record<string,string|undefined>>,locale:string,module:string):boolean{
 const selected=definitions.filter(definition=>definition.module===module);return selected.length>0&&selected.every(definition=>(definition.pluralParameter?requiredPluralVariants(locale).map(variant=>definition.id+'.'+variant):[definition.id]).every(key=>typeof messages[key]==='string'&&Boolean(messages[key]?.trim())));
}
export function requireCommerceMessages(messages:SiteMessages,locale:string):LegacySiteMessages{
 if(!hasRuntimeModule(messages,locale,'store'))throw new RuntimeContentError();return messages as LegacySiteMessages;
}
