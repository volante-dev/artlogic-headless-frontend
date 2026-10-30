"use client";
import type {Artwork} from "@/lib/api/artworks";
import {useSiteContent} from "./SiteContentProvider";
import {localizedPath} from "@/lib/i18n/routes";
import {ArtworkImage} from "./ArtworkImage";
import {ArtworkLink as FreshLink} from "./artworks/ArtworkLink";
import styles from "./Artwork.module.css";
import {Typography} from "./ui/Typography";
export interface ArtworkCardProps {art:Artwork&{slug?:string};eager?:boolean}
export function ArtworkCard({art,eager=false}:ArtworkCardProps){const site=useSiteContent();return <li className={styles.card} data-artwork-card data-testid="artwork-card"><FreshLink href={localizedPath("/artworks/"+(art.slug??art.id),site.locale,site.defaultLocale)}><div className={styles.cardImage}><ArtworkImage media={art.media[0]} title={art.title} decorative eager={eager}/></div><Typography variant="h3" component="h2">{art.title??site.messages["artwork.untitled"]}</Typography><Typography color="text.secondary">{art.artist??site.messages["artwork.unknownArtist"]}</Typography></FreshLink></li>;}
