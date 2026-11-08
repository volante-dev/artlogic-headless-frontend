"use client";
import type {Artwork} from "@/lib/api/artworks";
import {useSiteContent} from "./SiteContentProvider";
import {localizedPath} from "@/lib/i18n/routes";
import {ArtworkImage} from "./ArtworkImage";
import {ArtworkLink as FreshLink} from "./artworks/ArtworkLink";
import styles from "./Artwork.module.css";
import {Typography} from "./ui/Typography";
export interface ArtworkCardProps {art:Artwork&{slug?:string};eager?:boolean;imageFit?:"cover"|"contain";imageSizes?:string}
export function ArtworkCard({art,eager=false,imageFit,imageSizes}:ArtworkCardProps){const site=useSiteContent();return <li className={styles.card} data-artwork-card data-image-fit={imageFit} data-testid="artwork-card"><FreshLink href={localizedPath("/artworks/"+(art.slug??art.id),site.locale,site.defaultLocale)}><div className={styles.cardImage} data-artwork-card-image><ArtworkImage sizes={imageSizes} media={art.media[0]} title={art.title} decorative eager={eager}/></div><div data-artwork-caption><Typography variant="h3" component="h2">{art.title??site.messages["artwork.untitled"]}</Typography><Typography color="text.secondary">{art.artist??site.messages["artwork.unknownArtist"]}</Typography>{imageFit&&<span data-artwork-selection-action aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M5 19 19 5M5 5h14v14"/></svg></span>}</div></FreshLink></li>;}
