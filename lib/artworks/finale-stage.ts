/** Presentation stages never add synthetic media IDs to the catalogue. */
export type ArtworkStage={kind:"photo";mediaId:string}|{kind:"overview"}|{kind:"finale";anchorMediaId:string|null};
export function createFinaleStage(mediaIds:readonly string[],displayedId:string|null):Extract<ArtworkStage,{kind:"finale"}>{
 return {kind:"finale",anchorMediaId:displayedId&&mediaIds.includes(displayedId)?displayedId:mediaIds.at(-1)??null};
}
export function finaleStack(mediaIds:readonly string[],anchor:string|null):string[]{
 const index=anchor===null?-1:mediaIds.indexOf(anchor);if(index<0)return [];
 return mediaIds.slice(Math.max(0,index-4),index+1).reverse();
}
export function reconcileArtworkStage(stage:ArtworkStage,mediaIds:readonly string[]):ArtworkStage{
 if(stage.kind==="finale")return createFinaleStage(mediaIds,stage.anchorMediaId);
 if(stage.kind==="photo")return mediaIds.includes(stage.mediaId)?stage:mediaIds.length?{kind:"photo",mediaId:mediaIds[0]}:{kind:"overview"};
 return stage;
}
