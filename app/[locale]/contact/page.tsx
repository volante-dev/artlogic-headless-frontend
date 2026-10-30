import {Suspense} from "react";
import {sectionMetadata} from "@/components/PageShell";
import {ContactPage} from "@/components/contact/ContactPage";
export const generateMetadata=()=>sectionMetadata("contact");
export default function Page({searchParams}:{searchParams:Promise<{artwork?:string|string[]}>}){return <Suspense fallback={null}><ContactPage searchParams={searchParams}/></Suspense>;}
