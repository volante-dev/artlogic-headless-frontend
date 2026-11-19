"use client";
import {masonryImageSizes} from "@/lib/media/public-image-sizes";
import Box from "@mui/material/Box";
import {useRef,type CSSProperties,type ComponentType} from "react";
import {useCatalogEntrance} from "./useCatalogEntrance";
import {ArtworkCatalog,type ArtworkCatalogProps,type CatalogListProps} from "./ArtworkCatalog";
import {ArtworkMasonryCard,type ArtworkMasonryCardProps} from "./ArtworkMasonryCard";
import classic from "../Artwork.module.css";
import styles from "./ArtworkMasonryCatalog.module.css";
export interface ArtworkMasonryCatalogProps extends Omit<ArtworkCatalogProps,"CardView"|"ListView"> {CardView?:ComponentType<ArtworkMasonryCardProps>}
function MasonryList({items,columns,CardView,eagerFrom=0}:CatalogListProps){
 const root=useRef<HTMLUListElement>(null);useCatalogEntrance(root);
 const Card=CardView as ComponentType<ArtworkMasonryCardProps>;
 return <div className={styles.container}><Box component="ul" ref={root} className={[classic.grid,styles.grid].join(" ")} style={{"--catalog-columns":columns} as CSSProperties} data-catalog-layout="masonry">
  {items.map((art,index)=><Card key={art.id} art={art} previewOnHover={false} mobileLandscape={(art.media[0]?.width??0)>(art.media[0]?.height??0)} imageSizes={masonryImageSizes((art.media[0]?.width??1)/(art.media[0]?.height??1),columns,art.catalogLarge===true)} eager={index<columns||index>=eagerFrom&&index<eagerFrom+columns} rootClassName={styles.tile}/>)}
 </Box></div>;
}
export function ArtworkMasonryCatalog({CardView=ArtworkMasonryCard,...props}:ArtworkMasonryCatalogProps){return <ArtworkCatalog {...props} CardView={CardView} ListView={MasonryList}/>;}
