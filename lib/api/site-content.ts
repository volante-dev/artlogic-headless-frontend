import "server-only";
import {publicJson,PublicApiError,uuidPattern} from "./client";
import type {components} from "./generated";
import {messageRegistry,type SiteMessages} from "../i18n/messages.generated";
export type SiteContent=components["schemas"]["SiteContentPublic"];
function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new PublicApiError(503,"invalid_response");return value as Record<string,unknown>;}
export async function getSiteContent(locale:string):Promise<SiteContent>{
  const raw=object(await publicJson("/v1/public/site-content?locale="+encodeURIComponent(locale))),policy=object(raw.policy),messages=object(raw.messages);
  if(raw.locale!==locale||!Number.isSafeInteger(raw.revision)||Number(raw.revision)<1||typeof policy.defaultLocale!=="string"||typeof policy.fingerprint!=="string"||!/^[a-f0-9]{64}$/.test(policy.fingerprint)||!Array.isArray(policy.locales)||policy.locales.length<1||policy.locales.length>8)throw new PublicApiError(503,"invalid_response");
  const locales=policy.locales.map(value=>{const l=object(value);if(typeof l.code!=="string"||typeof l.label!=="string"||!l.label.trim()||Array.from(l.label).length>80||l.code.length>35||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(l.code))throw new PublicApiError(503,"invalid_response");return {code:l.code,label:l.label};});
  if(new Set(locales.map(l=>l.code)).size!==locales.length||!locales.some(l=>l.code===policy.defaultLocale))throw new PublicApiError(503,"invalid_response");
  const resolved=Object.fromEntries(messageRegistry.messages.map(m=>{const value=messages[m.key];if(typeof value!=="string"||!value.trim()||Array.from(value).length>m.maxLength)throw new PublicApiError(503,"invalid_response");return [m.key,value];})) as SiteMessages;
  let logo:SiteContent["logo"]=null;
  if(raw.logo!==null){const l=object(raw.logo);if(typeof l.id!=="string"||!uuidPattern.test(l.id)||l.mimeType!=="image/webp"||![l.width,l.height,l.byteSize].every(Number.isSafeInteger)||Number(l.width)<1||Number(l.width)>1024||Number(l.height)<1||Number(l.height)>1024||Number(l.byteSize)<1||Number(l.byteSize)>2097152)throw new PublicApiError(503,"invalid_response");logo={id:l.id,width:Number(l.width),height:Number(l.height),byteSize:Number(l.byteSize),mimeType:"image/webp"};}
  return {revision:Number(raw.revision),locale,policy:{defaultLocale:policy.defaultLocale,locales,fingerprint:policy.fingerprint},messages:resolved,logo};
}
