import type {ArtworkStage} from "./finale-stage";
/** Visual identifiers only. This object is never evidence of publication or origin. */
export interface MobileArtworkVisualSnapshot {
 version:1|2;scope:"public"|"preview";artworkId:string;selectedMediaId:string|null;
 stage?:ArtworkStage;mode:"gallery"|"information"|"examine"|"finale";zoom:1|2;pan:{x:number;y:number};informationScrollTop:number;finaleScrollTop?:number;
}
