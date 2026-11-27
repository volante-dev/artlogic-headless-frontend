import {runtimeText} from '@/lib/i18n/site-messages';
import {Suspense} from "react";
import {notFound} from "next/navigation";
import {HeaderRouteCommit} from "@/components/header/HeaderRouteCommit";
import {loadHeaderRouteContext} from "@/lib/header/load-route-context";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {pageAlternates} from "@/lib/seo/metadata";
import {RichText} from "@/components/editorial/RichText";
import {loadStoreLegalDocument, type StoreLegalDocument} from "@/lib/commerce/legal";
import {LegalDocument} from "@/components/commerce/LegalDocument";
import {PublicApiError} from "@/lib/api/client";
import styles from "./page.module.css";

async function legalContent() {
  const site = await loadSiteContent();
  if (site.contentUnavailable) throw Error("legal_content_unavailable");
  let document: StoreLegalDocument | null = null;
  try {
    document = await loadStoreLegalDocument("legal", site.locale);
  } catch (error) {
    if (!(error instanceof PublicApiError && error.status === 404)) throw error;
  }
  if (!document && !site.legalPage) notFound();
  return {...site, document};
}

export async function generateMetadata() {
  const site = await legalContent();
  const title = (site.document?.title ?? site.legalPage!.title) + " | " + site.siteName;
  const description = runtimeText(site.messages,site.locale,'seo.legalDescription',{siteName:site.siteName});
  return {title, description, alternates: pageAlternates("/legal", site.locale, site.policy, site.siteOrigin), openGraph: {title, description}};
}

async function LegalContent() {
  const site = await legalContent();
  return <>
    {site.document ? <LegalDocument document={site.document} messages={site.messages}/> : <article className={styles.page} lang={site.legalPage!.locale}>
      <h1>{site.legalPage!.title}</h1>
      <RichText document={site.legalPage!.body} className={styles.body}/>
    </article>}
    <HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/>
  </>;
}

export default function LegalPage() {
  return <Suspense fallback={null}><LegalContent/></Suspense>;
}
