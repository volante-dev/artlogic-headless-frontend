import {Suspense} from "react";
import {PageShell,sectionMetadata} from "@/components/PageShell";
export const generateMetadata=()=>sectionMetadata("expertise");
export default function Page(){return <Suspense fallback={null}><PageShell section="expertise"/></Suspense>;}
