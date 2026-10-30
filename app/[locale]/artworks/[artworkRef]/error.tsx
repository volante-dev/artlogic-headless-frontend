"use client";
import {ArtworkRouteState} from "@/components/artworks/ArtworkRouteState";
export default function Error({retry}:{retry:()=>void}){return <ArtworkRouteState status="error" retry={retry}/>;}
