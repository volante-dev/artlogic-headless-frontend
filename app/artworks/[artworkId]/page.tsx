import {Suspense} from "react";
import type {Metadata} from "next";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {getArtwork} from "@/lib/api/artworks";
import {PublicApiError} from "@/lib/api/client";
import {loadConfig,stringValue} from "@/lib/config/env";
import {ArtworkDetails} from "@/components/ArtworkDetails";
type Props={params:Promise<{artworkId:string}>};
async function read(artworkId:string){try{return await getArtwork(artworkId);}catch(error){if(error instanceof PublicApiError&&error.status===404)notFound();throw error;}}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  await connection();const config=loadConfig();let art;
  try{art=await read((await params).artworkId);}catch(error){if(error instanceof PublicApiError)return {title:"Catalogue indisponible",robots:{index:false,follow:false}};throw error;}
  return {title:(art.title??"Titre non renseigné")+" — "+stringValue(config,"SITE_NAME"),description:art.artist??undefined,openGraph:{title:art.title??"Titre non renseigné",images:art.media[0]?[{url:"/media/"+art.media[0].id,width:art.media[0].width,height:art.media[0].height,alt:art.media[0].alt??art.title??"Vue de l’œuvre"}]:[]}};
}
async function Detail({params}:Props){await connection();const art=await read((await params).artworkId);return <ArtworkDetails art={art}/>;}
export default function Page(props:Props){return <Suspense fallback={<p role="status">Chargement de l’œuvre…</p>}><Detail {...props}/></Suspense>;}
