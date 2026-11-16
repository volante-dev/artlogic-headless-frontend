import {Suspense} from "react";
import {notFound} from "next/navigation";
import {HeaderRouteCommit} from "@/components/header/HeaderRouteCommit";
import {loadHeaderRouteContext} from "@/lib/header/load-route-context";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {pageAlternates} from "@/lib/seo/metadata";
import {RichText} from "@/components/editorial/RichText";
import styles from "./page.module.css";

async function legalContent(){const site=await loadSiteContent();if(site.contentUnavailable)throw Error("legal_content_unavailable");if(!site.legalPage)notFound();return {...site,legalPage:site.legalPage};}
export async function generateMetadata(){const site=await legalContent(),title=site.legalPage.title+" — "+site.siteName,description=site.locale.startsWith("en")?`Legal information, hosting and privacy information for ${site.siteName}.`:`Informations légales, hébergement et protection des données de la ${site.siteName}.`;return {title,description,alternates:pageAlternates("/legal",site.locale,site.policy,site.siteOrigin),openGraph:{title,description}};}
async function LegalContent(){const site=await legalContent();return <><article className={styles.page} lang={site.legalPage.locale}><h1>{site.legalPage.title}</h1><RichText document={site.legalPage.body} className={styles.body}/></article><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
export default function LegalPage(){return <Suspense fallback={null}><LegalContent/></Suspense>;}
