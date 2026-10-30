import {CatalogLoading} from "@/components/CatalogLoading";
import {Suspense} from "react";
import {PublicPage} from "@/lib/presentation/load-page";
import {sectionMetadata} from "@/components/PageShell";
import type {CatalogParams} from "@/lib/artworks/catalog-query";
export const generateMetadata=()=>sectionMetadata("artworks");
export default function Page(props:{searchParams:Promise<CatalogParams>}){return <Suspense fallback={<CatalogLoading/>}><PublicPage {...props}/></Suspense>;}
