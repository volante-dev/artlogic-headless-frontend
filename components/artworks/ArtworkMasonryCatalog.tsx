"use client";
import {squareImageSizes} from "@/lib/media/public-image-sizes";
import Box from "@mui/material/Box";
import type {CSSProperties,ComponentType} from "react";
import {ArtworkCatalog,type ArtworkCatalogProps,type CatalogListProps} from "./ArtworkCatalog";
import {ArtworkMasonryCard,type ArtworkMasonryCardProps} from "./ArtworkMasonryCard";
import classic from "../Artwork.module.css";
import styles from "./ArtworkMasonryCatalog.module.css";
export interface ArtworkMasonryCatalogProps extends Omit<ArtworkCatalogProps,"CardView"|"ListView"> {CardView?:ComponentType<ArtworkMasonryCardProps>}
function MasonryList({items,columns,CardView}:CatalogListProps){
 const Card=CardView as ComponentType<ArtworkMasonryCardProps>;
 return <div className={styles.container}><Box component="ul" className={[classic.grid,styles.grid].join(" ")} style={{"--catalog-columns":columns} as CSSProperties} data-catalog-layout="masonry">
  {items.map((art,index)=><Card key={art.id} art={art} imageSizes={squareImageSizes((art.media[0]?.width??1)/(art.media[0]?.height??1),columns,art.catalogLarge===true)} eager={index<columns} rootClassName={styles.tile}/>)}
 </Box></div>;
}
export function ArtworkMasonryCatalog({CardView=ArtworkMasonryCard,...props}:ArtworkMasonryCatalogProps){return <ArtworkCatalog {...props} CardView={CardView} ListView={MasonryList}/>;}
