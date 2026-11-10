import type {components} from "../api/generated";
export type GalleryArtwork=components["schemas"]["GalleryArtwork"];
export type GalleryCatalog=components["schemas"]["GalleryCatalog"] | components["schemas"]["GalleryCatalogPlp"];
export type GalleryExperience=components["schemas"]["GalleryExperience"];
export type GalleryPreviewExperience=components["schemas"]["GalleryPreviewExperience"];
export type ArtworkTypeFilters=components["schemas"]["GalleryTypeFilters"];
export interface GallerySearch {types?:number[];locale?:string;q?:string;page?:number;pageSize?:number;catalogRevision?:number}

export type {ArtworkStage} from "./finale-stage";
