import {EditorialListLoading} from "@/components/editorial/EditorialListLoading";
import {Suspense} from "react";
import {sectionMetadata} from "@/components/PageShell";
import {EditorialListPage} from "@/components/editorial/EditorialListPage";
export const generateMetadata=()=>sectionMetadata("news");
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <Suspense fallback={<EditorialListLoading kind="news"/>}><EditorialListPage kind="news" searchParams={searchParams}/></Suspense>;}
