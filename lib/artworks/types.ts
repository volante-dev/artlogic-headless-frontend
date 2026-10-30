import type {components} from "../api/generated";
export type GalleryArtwork=components["schemas"]["GalleryArtwork"];
export type GalleryCatalog=components["schemas"]["GalleryCatalog"];
export type GalleryExperience=components["schemas"]["GalleryExperience"];
export type GalleryPreviewExperience=components["schemas"]["GalleryPreviewExperience"];
export interface GallerySearch {q?:string;page?:number;pageSize?:number;catalogRevision?:number}
