import {requestLanguagePolicy,requestRoutingPolicy} from './request-language';
import "server-only";
import {cache} from "react";
import {connection} from "next/server";
import {headers} from "next/headers";
import {createHash} from "node:crypto";
import {loadConfig,stringValue,configuredLocalePolicy,canonicalJson} from "../config/env";
import {getSiteContent,type SiteContent} from "../api/site-content";
import {initialMessages,messageRegistry} from "./messages.generated";
import {runtimeText,legacyRuntimeMessages} from "./site-messages";
function fallbackMessages(locale:string){if(!messageRegistry.messages.every(message=>Object.hasOwn(message.initial,locale)))throw new Error("language_content_unavailable");return legacyRuntimeMessages(initialMessages(locale,locale),locale);}
export type LoadedSiteContent=SiteContent&{contentUnavailable:boolean;siteName:string;siteOrigin:string;description:string;runtimeRequired?:boolean};
export const loadSiteContent=cache(async():Promise<LoadedSiteContent>=>{
  await connection();
  const config=loadConfig(),read=await requestLanguagePolicy(),legacy=configuredLocalePolicy(config),unavailable=(await headers()).get('x-site-language-unavailable')==='1',policy=unavailable?{defaultLocale:legacy.defaultLocale,locales:legacy.locales.filter(value=>value.code===legacy.defaultLocale)}:await requestRoutingPolicy(),requested=(await headers()).get("x-site-locale");
  const locale=policy.locales.some(l=>l.code===requested)?requested!:policy.defaultLocale;
  const fingerprint=read.kind==='legacy'||unavailable?createHash("sha256").update(canonicalJson({...legacy,catalogue:messageRegistry}),"utf8").digest("hex"):"";
  let content:SiteContent,contentUnavailable=false;
  if((await headers()).get('x-site-language-unavailable')==='1')return {revision:1,locale:policy.defaultLocale,policy:{defaultLocale:policy.defaultLocale,locales:policy.locales.filter(value=>value.code===policy.defaultLocale),fingerprint},messages:fallbackMessages(policy.defaultLocale),logo:null,contentUnavailable:true,siteName:stringValue(config,'SITE_NAME'),siteOrigin:stringValue(config,'SITE_ORIGIN'),description:stringValue(config,'SITE_DESCRIPTION'),runtimeRequired:config.SITE_LANGUAGES_RUNTIME_REQUIRED==='true'};
  try{content=await getSiteContent(locale);if(canonicalJson({defaultLocale:content.policy.defaultLocale,locales:content.policy.locales})!==canonicalJson(policy)||(read.kind==='runtime'?content.languagePolicy?.publicRevision!==read.policy.publicRevision:content.policy.fingerprint!==fingerprint))throw new Error("site_content_configuration_mismatch");}
  catch(error){if(read.kind!=='legacy')throw error;contentUnavailable=true;content={revision:1,locale,policy:{...policy,locales:[...policy.locales],fingerprint},messages:fallbackMessages(locale),logo:null};}
  return {...content,contentUnavailable,runtimeRequired:config.SITE_LANGUAGES_RUNTIME_REQUIRED==='true',siteName:stringValue(config,"SITE_NAME"),siteOrigin:stringValue(config,"SITE_ORIGIN"),description:locale===policy.defaultLocale?stringValue(config,"SITE_DESCRIPTION"):runtimeText(content.messages,locale,"seo.section.home",{siteName:stringValue(config,"SITE_NAME")})};
});
