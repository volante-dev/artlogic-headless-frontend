import {loadHeaderRouteContext} from "@/lib/header/load-route-context";
import {HeaderRouteCommit} from "@/components/header/HeaderRouteCommit";
import {LocalizedNotFound} from "@/components/LocalizedNotFound";
import {Suspense} from "react";
import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {PublicPage} from "@/lib/presentation/load-page";
import {loadPublicPresentation} from "@/lib/presentation/load-public";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
export async function generateMetadata(){try{const [page,site]=await Promise.all([loadPublicPresentation(),loadSiteContent()]);return {title:(page.pageIdentity?.name??site.siteName)+" — "+site.siteName,description:page.metaDescription??site.description,openGraph:{description:page.metaDescription??site.description},alternates:{canonical:page.pageIdentity?.canonicalPath}};}catch{return {robots:{index:false,follow:false}};}}
async function GaleristPage(){const context=await headers();if(context.get("x-site-page-key")!=="galerist"){if(context.get("x-site-error")){const snapshot=await loadHeaderRouteContext();return <>{snapshot.status==='not-found'?<LocalizedNotFound/>:<section><h1>{snapshot.site.messages['error.presentationTitle']}</h1><p role="alert">{snapshot.site.messages['error.presentationMessage']}</p></section>}<HeaderRouteCommit snapshot={snapshot}/></>;}notFound();}return <PublicPage/>;}
export default function Page(){return <Suspense fallback={<div role="status" aria-label="Chargement"/>}><GaleristPage/></Suspense>;}
