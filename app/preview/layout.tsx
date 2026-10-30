import {Suspense} from "react";
import type {Metadata} from "next";
import "../globals.css";
export const metadata:Metadata={title:"Aperçu privé",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function PreviewLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><Suspense fallback={<p role="status">Ouverture de l’aperçu…</p>}>{children}</Suspense></body></html>;}
