import "server-only";
import {cache} from "react";
import {connection} from "next/server";
import {headers} from "next/headers";
import {configuredLocalePolicy,loadConfig} from "../config/env";
import {getPublicPresentation} from "./client";
import type {PageKey} from "./types";

/** Shared by the shell and page so a single request never mixes two publications. */
export const loadPublicPresentation=cache(async()=>{
  await connection();const context=await headers(),policy=configuredLocalePolicy(loadConfig());
  const path=context.get("x-site-path")??"/",requested=context.get("x-site-locale");
  const locale=policy.locales.some(l=>l.code===requested)?requested!:policy.defaultLocale;
  if(context.get("x-site-page-key")==="galerist"){
    const release=context.get("x-site-page-release-id"),canonical=context.get("x-site-page-canonical");
    if(!release||!canonical||!/^[-0-9a-f]{36}$/i.test(release))throw new Error("invalid_page_context");
    const result=await getPublicPresentation("galerist",locale,release,context.get("x-vercel-id")??undefined);
    if(result.releaseId!==release||result.pageIdentity?.canonicalPath!==canonical)throw new Error("presentation_release_changed");return result;
  }
  const pageKey:PageKey=path==="/"?"home":path.startsWith("/artworks/")?"artworkDetail":path.startsWith("/publications/")?"publications":path.startsWith("/news/")?"news":path.startsWith("/exhibitions/")?"exhibitions":path.slice(1) as PageKey;
  return getPublicPresentation(pageKey,locale,undefined,context.get("x-vercel-id")??undefined);
});
