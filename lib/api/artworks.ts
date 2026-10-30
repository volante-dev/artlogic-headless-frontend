import "server-only";
import {publicJson,PublicApiError,uuidPattern} from "./client";
import type {components} from "./generated";
export type Artwork=components["schemas"]["PublicArtwork"];
export type ArtworkPage=components["schemas"]["PublicArtworkPage"];
function object(value:unknown):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new PublicApiError(503,"invalid_response");return value as Record<string,unknown>;}
function text(value:unknown):string|null{if(value===null||typeof value==="string")return value;throw new PublicApiError(503,"invalid_response");}
function id(value:unknown):string{if(typeof value==="string"&&uuidPattern.test(value))return value;throw new PublicApiError(503,"invalid_response");}
function dimension(value:unknown):number{if(typeof value==="number"&&Number.isSafeInteger(value)&&value>0)return value;throw new PublicApiError(503,"invalid_response");}
function artwork(value:unknown):Artwork{
  const art=object(value);if(!Array.isArray(art.media))throw new PublicApiError(503,"invalid_response");
  return {id:id(art.id),title:text(art.title),artist:text(art.artist),year:text(art.year),medium:text(art.medium),dimensions:text(art.dimensions),media:art.media.map(value=>{
    const media=object(value),mediaId=id(media.id);if(media.path!=="/v1/public/media/"+mediaId)throw new PublicApiError(503,"invalid_response");
    return {id:mediaId,alt:text(media.alt),width:dimension(media.width),height:dimension(media.height),path:media.path as string};
  })};
}
export async function getArtwork(artworkId:string):Promise<Artwork>{if(!uuidPattern.test(artworkId))throw new PublicApiError(404,"not_found");return artwork(await publicJson("/v1/public/artworks/"+artworkId));}
export async function listArtworks(cursor?:string,{restartOnChange=true}:{restartOnChange?:boolean}={}):Promise<ArtworkPage&{restarted:boolean}>{
  if(cursor&&cursor.length>2048)throw new PublicApiError(400,"invalid_request");let restarted=false,value:unknown;
  try{value=await publicJson("/v1/public/artworks?limit=20"+(cursor?"&cursor="+encodeURIComponent(cursor):""));}
  catch(error){if(!(error instanceof PublicApiError)||error.code!=="catalog_changed"||!cursor||!restartOnChange)throw error;value=await publicJson("/v1/public/artworks?limit=20");restarted=true;}
  const page=object(value);if(!Array.isArray(page.items)||page.items.length>100||!(page.nextCursor===null||typeof page.nextCursor==="string")||typeof page.catalogRevision!=="number"||!Number.isSafeInteger(page.catalogRevision)||page.catalogRevision<0)throw new PublicApiError(503,"invalid_response");
  return {items:page.items.map(artwork),nextCursor:page.nextCursor,catalogRevision:page.catalogRevision,restarted};
}
