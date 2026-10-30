/** Visual identifiers only. This object is never evidence of publication or origin. */
export interface MobileArtworkVisualSnapshot {
 version:1;scope:"public"|"preview";artworkId:string;selectedMediaId:string|null;
 mode:"gallery"|"information"|"examine";zoom:1|2;pan:{x:number;y:number};informationScrollTop:number;
}
