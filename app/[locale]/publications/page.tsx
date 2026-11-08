import {EditorialListLoading} from "@/components/editorial/EditorialListLoading";
import {Suspense} from "react";
import {sectionMetadata} from "@/components/PageShell";
import {EditorialListPage} from "@/components/editorial/EditorialListPage";
export const generateMetadata=()=>sectionMetadata("publications");
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <Suspense fallback={<EditorialListLoading kind="publication"/>}><EditorialListPage kind="publication" searchParams={searchParams}/></Suspense>;}
