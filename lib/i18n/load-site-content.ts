import "server-only";
import {cache} from "react";
import {connection} from "next/server";
import {headers} from "next/headers";
import {createHash} from "node:crypto";
import {loadConfig,stringValue,configuredLocalePolicy,canonicalJson} from "../config/env";
import {getSiteContent,type SiteContent} from "../api/site-content";
import {initialMessages,messageRegistry} from "./messages.generated";
export const loadSiteContent=cache(async()=>{
  await connection();
  const config=loadConfig(),policy=configuredLocalePolicy(config),requested=(await headers()).get("x-site-locale");
  const locale=policy.locales.some(l=>l.code===requested)?requested!:policy.defaultLocale;
  const fingerprint=createHash("sha256").update(canonicalJson({...policy,catalogue:messageRegistry}),"utf8").digest("hex");
  let content:SiteContent;
  try{content=await getSiteContent(locale);if(content.policy.fingerprint!==fingerprint||canonicalJson({defaultLocale:content.policy.defaultLocale,locales:content.policy.locales})!==canonicalJson(policy))throw new Error("site_content_configuration_mismatch");}
  catch{content={revision:1,locale,policy:{...policy,fingerprint},messages:initialMessages(locale,policy.defaultLocale),logo:null};}
  return {...content,siteName:stringValue(config,"SITE_NAME"),siteOrigin:stringValue(config,"SITE_ORIGIN"),description:stringValue(config,"SITE_DESCRIPTION")};
});
