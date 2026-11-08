import type {MetadataRoute} from "next";
import {connection} from "next/server";
import {loadConfig,stringValue} from "@/lib/config/env";
export default async function robots():Promise<MetadataRoute.Robots>{await connection();const config=loadConfig(),publicSite=config.DEPLOYMENT_ENV==="production"&&config.DATA_MODE!=="mock";return {rules:publicSite?{userAgent:"*",allow:"/",disallow:["/api/","/preview/"]}:{userAgent:"*",disallow:"/"},sitemap:stringValue(config,"SITE_ORIGIN")+"/sitemap.xml"};}
