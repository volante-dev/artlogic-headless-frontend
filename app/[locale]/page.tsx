import {CatalogLoading} from "@/components/CatalogLoading";
import {Suspense} from "react";
import {sectionMetadata} from "@/components/PageShell";
import {PublicPage} from "@/lib/presentation/load-page";
export const generateMetadata=()=>sectionMetadata("home");
export default function Page(){return <Suspense fallback={<CatalogLoading/>}><PublicPage/></Suspense>;}
