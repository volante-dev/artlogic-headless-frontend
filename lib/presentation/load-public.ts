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
  const pageKey:PageKey=path==="/"?"home":path.startsWith("/artworks/")?"artworkDetail":path.slice(1) as PageKey;
  return getPublicPresentation(pageKey,locale);
});
