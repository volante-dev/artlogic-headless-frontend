import type {Artwork} from "@/lib/api/artworks";
import {ArtworkImage} from "./ArtworkImage";
import {FreshLink} from "./FreshLink";
import styles from "./Artwork.module.css";
export function ArtworkCard({art,eager=false}:{art:Artwork;eager?:boolean}){return <li className={styles.card} data-testid="artwork-card"><FreshLink href={"/artworks/"+art.id}><div className={styles.cardImage}><ArtworkImage media={art.media[0]} title={art.title} decorative eager={eager}/></div><h2>{art.title??"Titre non renseigné"}</h2><p>{art.artist??"Artiste non renseigné"}</p></FreshLink></li>;}
