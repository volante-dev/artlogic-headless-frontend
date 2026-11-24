import {ArtworkViewProvider} from "@/components/artworks/ArtworkViewProvider";
import {resolveArtworkView} from "@/lib/artworks/artwork-view";
import {loadConfig} from "@/lib/config/env";
import {Suspense} from "react";
import type {Metadata} from "next";
import {PreviewLoading} from "@/components/preview/PreviewShell";
import "../globals.css";
export const metadata:Metadata={title:"Aperçu privé",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function PreviewLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><ArtworkViewProvider mode={resolveArtworkView(loadConfig().PRESENTATION_ARTWORK_VIEW)}><Suspense fallback={<PreviewLoading/>}>{children}</Suspense></ArtworkViewProvider></body></html>;}
