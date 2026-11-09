"use client";
import {squareImageSizes} from "@/lib/media/public-image-sizes";
import Box from "@mui/material/Box";
import type {ArtworkCardProps} from "../ArtworkCard";
import {ArtworkImage} from "../ArtworkImage";
import {ArtworkLink} from "./ArtworkLink";
import {Typography} from "../ui/Typography";
import {useSiteContent} from "../SiteContentProvider";
import {localizedPath} from "../../lib/i18n/routes";
import classic from "../Artwork.module.css";
import styles from "./ArtworkTile.module.css";
export interface ArtworkTileProps extends ArtworkCardProps {rootClassName?:string;fillMobile?:boolean;captionAccessory?:React.ReactNode}
export function ArtworkTile({art,eager=false,imageFit="cover",rootClassName,fillMobile=false,imageSizes,captionAccessory}:ArtworkTileProps){
 const site=useSiteContent(),title=art.title??site.messages["artwork.untitled"],artist=art.artist??site.messages["artwork.unknownArtist"];
 return <Box component="li" className={[classic.card,styles.tile,rootClassName].filter(Boolean).join(" ")} data-artwork-card data-image-fit={imageFit} data-fill-mobile={fillMobile||undefined} data-testid="artwork-card" data-catalog-large={art.catalogLarge===true?"true":"false"}>
  <ArtworkLink href={localizedPath("/artworks/"+(art.slug??art.id),site.locale,site.defaultLocale)} className={styles.link} aria-label={title+" — "+artist}>
   <div className={[classic.cardImage,styles.image].join(" ")} data-artwork-card-image><ArtworkImage sizes={imageSizes??squareImageSizes((art.media[0]?.width??1)/(art.media[0]?.height??1),3,art.catalogLarge===true,imageFit,true,fillMobile)} media={art.media[0]} title={art.title} decorative eager={eager}/></div>
   <Box className={styles.identity} data-artwork-caption><Typography variant="h3" component="h2">{title}</Typography>{captionAccessory?<div className={styles.captionLine}><Typography>{artist}</Typography>{captionAccessory}</div>:<Typography>{artist}</Typography>}</Box>
  </ArtworkLink>
 </Box>;
}
