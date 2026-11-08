import {Suspense} from "react";
import {EditorialArticlePage,editorialArticleMetadata} from "@/components/editorial/EditorialArticlePage";
export const generateMetadata=editorialArticleMetadata;
export default function Page(){return <Suspense fallback={null}><EditorialArticlePage/></Suspense>;}
