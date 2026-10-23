import {Suspense} from "react";
import {connection} from "next/server";
import type {Metadata} from "next";
import {loadConfig,stringValue} from "@/lib/config/env";
import {FreshLink} from "@/components/FreshLink";
import {RestoreFreshness} from "@/components/RestoreFreshness";
import "./globals.css";
export async function generateMetadata():Promise<Metadata>{await connection();const config=loadConfig();return {title:stringValue(config,"SITE_NAME"),description:stringValue(config,"SITE_DESCRIPTION"),metadataBase:new URL(stringValue(config,"SITE_ORIGIN"))};}
async function SiteHeader(){await connection();return <header><FreshLink href="/">{stringValue(loadConfig(),"SITE_NAME")}</FreshLink></header>;}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><a className="skip" href="#contenu">Aller au contenu</a><RestoreFreshness/><Suspense fallback={<header>Catalogue</header>}><SiteHeader/></Suspense><main id="contenu" tabIndex={-1}>{children}</main></body></html>;}
