import type {Artwork} from "@/lib/api/artworks";
import {ArtworkImage} from "./ArtworkImage";
import {FreshLink} from "./FreshLink";
import styles from "./Artwork.module.css";
export function ArtworkDetails({art}:{art:Artwork}){return <article><FreshLink href="/" className="back">Toutes les œuvres</FreshLink><h1>{art.title??"Titre non renseigné"}</h1><div className={styles.details}><div className={styles.images}>{art.media.length?art.media.map((media,index)=><ArtworkImage key={media.id} media={media} title={art.title} eager={index===0}/>):<ArtworkImage title={art.title}/>}</div><dl className={styles.description}>{[["Artiste",art.artist],["Année",art.year],["Technique",art.medium],["Dimensions",art.dimensions]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value??"Non renseigné"}</dd></div>)}</dl></div></article>;}
