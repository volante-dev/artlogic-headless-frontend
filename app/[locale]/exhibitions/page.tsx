import {EditorialListLoading} from "@/components/editorial/EditorialListLoading";
import {Suspense} from "react";
import {sectionMetadata} from "@/components/PageShell";
import {EditorialListPage} from "@/components/editorial/EditorialListPage";
export const generateMetadata=()=>sectionMetadata("exhibitions");
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <Suspense fallback={<EditorialListLoading kind="exhibition"/>}><EditorialListPage kind="exhibition" searchParams={searchParams}/></Suspense>;}
