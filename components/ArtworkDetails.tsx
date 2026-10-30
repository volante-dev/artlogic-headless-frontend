"use client";
import type {Artwork} from "@/lib/api/artworks";
import {useSiteContent} from "./SiteContentProvider";
import {localizedPath} from "@/lib/i18n/routes";
import {ArtworkImage} from "./ArtworkImage";
import {FreshLink} from "./FreshLink";
import styles from "./Artwork.module.css";
import {Typography} from "./ui/Typography";
import {ArtworkInquiryLink} from "./artworks/ArtworkInformation";
export function ArtworkDetails({art}:{art:Artwork}){const site=useSiteContent(),m=site.messages;return <article><FreshLink href={localizedPath("/artworks",site.locale,site.defaultLocale)} className="back">{m["artwork.back"]}</FreshLink><Typography variant="h1">{art.title??m["artwork.untitled"]}</Typography><div className={styles.details}><div className={styles.images}>{art.media.length?art.media.map((media,index)=><ArtworkImage key={media.id} media={media} title={art.title} eager={index===0}/>):<ArtworkImage title={art.title}/>}</div><dl className={styles.description}>{[[m["artwork.artist"],art.artist],[m["artwork.year"],art.year],[m["artwork.medium"],art.medium],[m["artwork.dimensions"],art.dimensions]].map(([label,value],index)=><div key={index}><dt>{label}</dt><dd>{value??m["artwork.unspecified"]}</dd></div>)}</dl></div><ArtworkInquiryLink id={art.id} locale={site.locale}/></article>;}
