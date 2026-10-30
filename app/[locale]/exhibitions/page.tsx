import {Suspense} from "react";
import {PageShell,sectionMetadata} from "@/components/PageShell";
export const generateMetadata=()=>sectionMetadata("exhibitions");
export default function Page(){return <Suspense fallback={null}><PageShell section="exhibitions"/></Suspense>;}
