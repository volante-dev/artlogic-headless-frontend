import {archivedRuntimeMessageCatalogues} from '../i18n/message-archives.generated';
import {runtimeMessageDefinitions} from '../i18n/message-definitions.generated';
import {createHash} from 'node:crypto';
import {requestLanguagePolicy} from '../i18n/request-language';
import {decodeLanguagePolicy,type PublicLanguagePolicy} from '../i18n/language-policy-protocol';
import {canonicalJson,loadConfig,stringValue} from '../config/env';
import "server-only";
import {publicJson,PublicApiError,uuidPattern} from "./client";
import type {components} from "./generated";
import {messageRegistry,type SiteMessages as LegacySiteMessages} from "../i18n/messages.generated";
import {legacyRuntimeMessages,type SiteMessages,type RuntimeCatalogueContext} from '../i18n/site-messages';
import {runtimeMessageCatalogueId} from '../i18n/message-definitions.generated';
import {decodeRuntimeMessages} from '../i18n/runtime-content';
import {parseLegalPage} from "../legal/validate";
export type SiteContent=Omit<components['schemas']['SiteContentPublic'],'messages'|'revision'>&{revision:number|string;messages:SiteMessages;runtime?:RuntimeCatalogueContext;languagePolicy?:PublicLanguagePolicy};
function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new PublicApiError(503,"invalid_response");return value as Record<string,unknown>;}
export async function getSiteContent(locale:string,signal?:AbortSignal):Promise<SiteContent>{
  const readJson=(path:string)=>signal?publicJson(path,{signal}):publicJson(path);
  const runtime=await requestLanguagePolicy();if(runtime.kind==='unavailable')throw new PublicApiError(503,'language_policy_unavailable');
  let raw:Record<string,unknown>,runtimeMessages:SiteMessages|undefined,runtimeCatalogue:RuntimeCatalogueContext|undefined;
  {
    const previousCatalogue='legacy-002-'+createHash('sha256').update(canonicalJson(messageRegistry),'utf8').digest('hex'),candidates=[...new Set([runtimeMessageCatalogueId,...archivedRuntimeMessageCatalogues.map(catalogue=>catalogue.id),previousCatalogue])];let catalogue:string=runtimeMessageCatalogueId,response:Record<string,unknown>|undefined;
    for(const candidate of candidates){catalogue=candidate;try{response=object(await readJson('/v1/public/languages/content?'+new URLSearchParams({locale,revision:runtime.policy.publicRevision,catalogue})));break;}catch(error){if(candidate===candidates.at(-1)||!(error instanceof PublicApiError)||error.code!=='capability_unavailable'||!error.details.some(detail=>detail.field==='catalogue'&&detail.reason==='unsupported_catalogue'))throw error;}}
    if(!response)throw new PublicApiError(503,'language_content_unavailable');
    const policy=decodeLanguagePolicy(response.policy,stringValue(loadConfig(),'SITE_ID'));
    if(typeof response.contentRevision!=='string'||!(/^[1-9][0-9]{0,18}$/).test(response.contentRevision)||BigInt(response.contentRevision)>BigInt('9223372036854775807')||response.contractVersion!==1||response.selectedCatalogueId!==catalogue||response.locale!==locale||policy.publicRevision!==runtime.policy.publicRevision||policy.defaultLocale!==runtime.policy.defaultLocale||canonicalJson(policy.locales)!==canonicalJson(runtime.policy.locales))throw new PublicApiError(503,'invalid_response');
    const selectedDefinitions=catalogue===runtimeMessageCatalogueId?runtimeMessageDefinitions:archivedRuntimeMessageCatalogues.find(archive=>archive.id===catalogue)?.definitions;
    if(selectedDefinitions){const decoded=decodeRuntimeMessages(response.messages,locale,selectedDefinitions);runtimeMessages=decoded.messages as SiteMessages;runtimeCatalogue={catalogueId:catalogue,contentRevision:response.contentRevision,publicRevision:policy.publicRevision,modules:decoded.modules};}
    const fingerprint=createHash('sha256').update(canonicalJson({siteId:policy.siteId,publicRevision:policy.publicRevision,catalogueId:catalogue,defaultLocale:policy.defaultLocale,locales:policy.locales}),'utf8').digest('hex');
    raw={revision:response.contentRevision,locale:response.locale,policy:{defaultLocale:policy.defaultLocale,locales:policy.locales.map(({code,label})=>({code,label})),fingerprint},messages:response.messages,logo:response.logo,whiteLogo:response.whiteLogo,legalPage:response.legalPage};
  }
  const policy=object(raw.policy),messages=object(raw.messages);
  if(raw.locale!==locale||!(typeof raw.revision==='number'&&Number.isSafeInteger(raw.revision)&&raw.revision>0||typeof raw.revision==='string'&&/^[1-9][0-9]{0,18}$/.test(raw.revision)&&BigInt(raw.revision)<=BigInt('9223372036854775807'))||typeof policy.defaultLocale!=="string"||typeof policy.fingerprint!=="string"||!/^[a-f0-9]{64}$/.test(policy.fingerprint)||!Array.isArray(policy.locales)||policy.locales.length<1||policy.locales.length>8)throw new PublicApiError(503,"invalid_response");
  const locales=policy.locales.map(value=>{const l=object(value);if(typeof l.code!=="string"||typeof l.label!=="string"||!l.label.trim()||Array.from(l.label).length>80||l.code.length>35||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(l.code))throw new PublicApiError(503,"invalid_response");return {code:l.code,label:l.label};});
  if(new Set(locales.map(l=>l.code)).size!==locales.length||!locales.some(l=>l.code===policy.defaultLocale))throw new PublicApiError(503,"invalid_response");
  const resolved=runtimeMessages??legacyRuntimeMessages(Object.fromEntries(messageRegistry.messages.map(m=>{const value=messages[m.key];if(typeof value!=="string"||!value.trim()||Array.from(value).length>m.maxLength)throw new PublicApiError(503,"invalid_response");return [m.key,value];})) as LegacySiteMessages,locale);
  let logo:SiteContent["logo"]=null;
  if(raw.logo!==null){const l=object(raw.logo);if(typeof l.id!=="string"||!uuidPattern.test(l.id)||l.mimeType!=="image/webp"||![l.width,l.height,l.byteSize].every(Number.isSafeInteger)||Number(l.width)<1||Number(l.width)>1024||Number(l.height)<1||Number(l.height)>1024||Number(l.byteSize)<1||Number(l.byteSize)>2097152)throw new PublicApiError(503,"invalid_response");logo={id:l.id,width:Number(l.width),height:Number(l.height),byteSize:Number(l.byteSize),mimeType:"image/webp"};}
  let whiteLogo:SiteContent["whiteLogo"]=null;
  if(raw.whiteLogo!=null){const l=object(raw.whiteLogo);if(typeof l.id!=="string"||!uuidPattern.test(l.id)||l.mimeType!=="image/webp"||![l.width,l.height,l.byteSize].every(Number.isSafeInteger)||Number(l.width)<1||Number(l.width)>1024||Number(l.height)<1||Number(l.height)>1024||Number(l.byteSize)<1||Number(l.byteSize)>2097152)throw new PublicApiError(503,"invalid_response");whiteLogo={id:l.id,width:Number(l.width),height:Number(l.height),byteSize:Number(l.byteSize),mimeType:"image/webp"};}
  const legalPage=parseLegalPage(raw.legalPage);if(legalPage&&!locales.some(l=>l.code===legalPage.locale))throw new PublicApiError(503,"invalid_response");
  return {revision:raw.revision as number|string,...(runtimeCatalogue?{runtime:runtimeCatalogue}:{}),languagePolicy:runtime.policy,locale,policy:{defaultLocale:policy.defaultLocale,locales,fingerprint:policy.fingerprint},messages:resolved,logo,whiteLogo,legalPage};
}
