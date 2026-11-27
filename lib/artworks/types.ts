import type {ArtworkAddress,ArtworkAddressSet} from './addresses';
import type {components} from "../api/generated";
export type GalleryArtwork=components["schemas"]["GalleryArtwork"]&{publicAddress?:ArtworkAddress};
export type GalleryCatalog=(Omit<components["schemas"]["GalleryCatalog"],"items">|Omit<components["schemas"]["GalleryCatalogPlp"],"items">)&{items:(GalleryArtwork&{catalogLarge?:boolean;heroFocus?:components["schemas"]["GalleryExperience"]["heroFocus"]|null})[];artworkAddresses?:ArtworkAddressSet};
export type GalleryExperience=Omit<components["schemas"]["GalleryExperience"],"artwork">&{artwork:GalleryArtwork;artworkAddresses?:ArtworkAddressSet};
export type GalleryPreviewExperience=components["schemas"]["GalleryPreviewExperience"];
export type ArtworkTypeFilters=components["schemas"]["GalleryTypeFilters"];
export interface GallerySearch {types?:number[];locale?:string;q?:string;page?:number;pageSize?:number;catalogRevision?:number}

export type {ArtworkStage} from "./finale-stage";
