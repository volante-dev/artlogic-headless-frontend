"use client";
import type {ArtworkCardProps} from "../../components/ArtworkCard";
import {ArtworkImage} from "../../components/ArtworkImage";
import {useScopedHref} from "../../components/FreshLink";
import {Typography} from "../../components/ui/Typography";
import {useSiteContent} from "../../components/SiteContentProvider";
import {localizedPath} from "../../lib/i18n/routes";
import styles from "./ArtworkCard.module.css";
export function DemoGalleryArtworkCard({art,eager=false}:ArtworkCardProps){const site=useSiteContent(),href=useScopedHref(localizedPath("/artworks/"+(art.slug??art.id),site.locale,site.defaultLocale));return <li className={styles.card} data-artwork-card data-testid="artwork-card" data-client="demo-gallery"><a href={href}><div className={styles.image}><ArtworkImage media={art.media[0]} title={art.title} decorative eager={eager}/></div><div className={styles.caption}><Typography variant="h3" component="h2">{art.title??site.messages["artwork.untitled"]}</Typography><Typography>{art.artist??site.messages["artwork.unknownArtist"]}</Typography>{(art.year||art.medium)&&<Typography variant="caption" color="text.secondary">{[art.year,art.medium].filter(Boolean).join(" · ")}</Typography>}</div></a></li>;}
