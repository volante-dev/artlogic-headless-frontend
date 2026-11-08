import {connection} from "next/server";
import {listArtworks} from "@/lib/api/artworks";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {localizedPath} from "@/lib/i18n/routes";
import {ArtworkCard} from "@/components/ArtworkCard";
import {FreshLink} from "@/components/FreshLink";
import styles from "@/components/Artwork.module.css";
export async function Catalog({searchParams,basePath="/"}:{searchParams:Promise<{cursor?:string|string[]}>;basePath?:string}){
  await connection();const site=await loadSiteContent(),m=site.messages,{cursor}=await searchParams;if(Array.isArray(cursor))throw new Error("invalid_catalog_query");const page=await listArtworks(cursor,{locale:site.locale});
  return <><h1>{m["page.artworks.title"]}</h1>{page.restarted&&<p role="status">{m["catalog.restarted"]}</p>}{page.items.length?<ul className={styles.grid}>{page.items.map((art,index)=><ArtworkCard key={art.id} art={art} eager={index<3}/>)}</ul>:<p>{m["catalog.empty"]}</p>}{page.nextCursor&&<FreshLink href={localizedPath(basePath,site.locale,site.policy.defaultLocale)+"?cursor="+encodeURIComponent(page.nextCursor)} className="button">{m["catalog.next"]}</FreshLink>}</>;
}
