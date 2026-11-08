import {Suspense} from "react";
import type {Metadata} from "next";
import {PreviewLoading} from "@/components/preview/PreviewShell";
import "../globals.css";
export const metadata:Metadata={title:"Aperçu privé",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function PreviewLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><Suspense fallback={<PreviewLoading/>}>{children}</Suspense></body></html>;}
