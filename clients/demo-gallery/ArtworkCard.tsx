"use client";
import {artworkHref} from '../../lib/artworks/artwork-href';
import type {ArtworkCardProps} from "../../components/ArtworkCard";
import {ArtworkCardMedia} from "../../components/artworks/ArtworkCardMedia";
import {useScopedHref} from "../../components/FreshLink";
import {Typography} from "../../components/ui/Typography";
import {useSiteContent} from "../../components/SiteContentProvider";
import styles from "./ArtworkCard.module.css";
export function DemoGalleryArtworkCard({art,eager=false,imageFit,imageSizes,previewOnHover=true,mobileLandscape=false}:ArtworkCardProps){const site=useSiteContent(),href=useScopedHref(artworkHref(art,site.locale,site.defaultLocale));return <li className={styles.card} data-artwork-card data-mobile-landscape={mobileLandscape||undefined} data-image-fit={imageFit} data-testid="artwork-card" data-client="demo-gallery"><a href={href}><div className={styles.image} data-artwork-card-image><ArtworkCardMedia heroFocus={art.heroFocus} previewOnHover={previewOnHover} sizes={imageSizes} media={art.media} title={art.title} eager={eager}/></div><div className={styles.caption} data-artwork-caption><Typography variant="h3" component="h2">{art.title??site.messages["artwork.untitled"]}</Typography><Typography>{art.artist??site.messages["artwork.unknownArtist"]}</Typography>{(art.year||art.medium)&&<Typography variant="caption" color="text.secondary">{[art.year,art.medium].filter(Boolean).join(" · ")}</Typography>}{imageFit&&<span data-artwork-selection-action aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M5 19 19 5M5 5h14v14"/></svg></span>}</div></a></li>;}
