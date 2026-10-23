import {Suspense} from "react";
import {connection} from "next/server";
import {listArtworks} from "@/lib/api/artworks";
import {ArtworkCard} from "@/components/ArtworkCard";
import {FreshLink} from "@/components/FreshLink";
import styles from "@/components/Artwork.module.css";
async function Catalog({searchParams}:{searchParams:Promise<{cursor?:string|string[]}>}){
  await connection();const {cursor}=await searchParams;if(Array.isArray(cursor))throw new Error("invalid_catalog_query");const page=await listArtworks(cursor);
  return <><h1>Œuvres</h1>{page.restarted&&<p role="status">La sélection a changé. Le catalogue reprend à la première page.</p>}{page.items.length?<ul className={styles.grid}>{page.items.map((art,index)=><ArtworkCard key={art.id} art={art} eager={index<3}/>)}</ul>:<p>Aucune œuvre publiée pour le moment.</p>}{page.nextCursor&&<FreshLink href={"/?cursor="+encodeURIComponent(page.nextCursor)} className="button">Voir la suite</FreshLink>}</>;
}
export default function Page(props:{searchParams:Promise<{cursor?:string|string[]}>}){return <Suspense fallback={<p role="status">Chargement des œuvres…</p>}><Catalog {...props}/></Suspense>;}
