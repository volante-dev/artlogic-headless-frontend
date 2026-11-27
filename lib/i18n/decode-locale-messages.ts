import {archivedRuntimeMessageCatalogues} from './message-archives.generated';
import {messageRegistry,type SiteMessages,type RuntimeCatalogueContext} from './site-messages';
import {runtimeMessageCatalogueId,runtimeMessageDefinitions} from './message-definitions.generated';
import {decodeRuntimeMessages,RuntimeContentError} from './runtime-content';
export function decodeLocaleMessages(messages:unknown,runtime:unknown,locale:string):{messages:SiteMessages;runtime?:RuntimeCatalogueContext}{
 if(!messages||typeof messages!=='object'||Array.isArray(messages))throw new RuntimeContentError();
 if(runtime!==undefined){
  if(!runtime||typeof runtime!=='object'||Array.isArray(runtime))throw new RuntimeContentError();const context=runtime as RuntimeCatalogueContext;
  const selected=context.catalogueId===runtimeMessageCatalogueId?runtimeMessageDefinitions:archivedRuntimeMessageCatalogues.find(catalogue=>catalogue.id===context.catalogueId)?.definitions;
  if(!selected||![context.publicRevision,context.contentRevision].every(value=>typeof value==='string'&&/^[1-9][0-9]{0,18}$/.test(value)&&BigInt(value)<=BigInt('9223372036854775807'))||!Array.isArray(context.modules)||new Set(context.modules).size!==context.modules.length)throw new RuntimeContentError();
  const decoded=decodeRuntimeMessages(messages,locale,selected);if(context.modules.length!==decoded.modules.length||context.modules.some(module=>!decoded.modules.includes(module)))throw new RuntimeContentError();
  return {messages:decoded.messages as SiteMessages,runtime:{catalogueId:context.catalogueId,publicRevision:context.publicRevision,contentRevision:context.contentRevision,modules:decoded.modules}};
 }
 const values=messages as Record<string,unknown>;if(messageRegistry.messages.some(definition=>{const value=values[definition.key];return typeof value!=='string'||!value.trim()||Array.from(value).length>definition.maxLength;}))throw new RuntimeContentError();
 return {messages:messages as SiteMessages};
}
