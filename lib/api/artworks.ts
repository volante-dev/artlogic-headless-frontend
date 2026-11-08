import "server-only";
import {publicJson,PublicApiError,uuidPattern} from "./client";
import type {components} from "./generated";
export type Artwork=components["schemas"]["PublicArtwork"] & {catalogLarge?:boolean};
export type ArtworkPage=components["schemas"]["PublicArtworkPage"] & {display?:"plp";layout?:"grid"|"masonry"};
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
export async function getArtwork(artworkId:string,locale?:string):Promise<Artwork>{if(!uuidPattern.test(artworkId))throw new PublicApiError(404,"not_found");return artwork(await publicJson("/v1/public/artworks/"+artworkId+(locale?"?locale="+encodeURIComponent(locale):"")));}
export async function listArtworks(cursor?:string,{restartOnChange=true,display,locale}:{restartOnChange?:boolean;display?:"plp";locale?:string}={}):Promise<ArtworkPage&{restarted:boolean}>{
  if(cursor&&cursor.length>2048)throw new PublicApiError(400,"invalid_request");let restarted=false,value:unknown;
  try{value=await publicJson("/v1/public/artworks?limit=20"+(locale?"&locale="+encodeURIComponent(locale):"")+(display?"&display=plp":"")+(cursor?"&cursor="+encodeURIComponent(cursor):""));}
  catch(error){if(!(error instanceof PublicApiError)||error.code!=="catalog_changed"||!cursor||!restartOnChange)throw error;value=await publicJson("/v1/public/artworks?limit=20"+(locale?"&locale="+encodeURIComponent(locale):"")+(display?"&display=plp":""));restarted=true;}
  const page=object(value);if(!Array.isArray(page.items)||page.items.length>100||!(page.nextCursor===null||typeof page.nextCursor==="string")||typeof page.catalogRevision!=="number"||!Number.isSafeInteger(page.catalogRevision)||page.catalogRevision<0)throw new PublicApiError(503,"invalid_response");
  if(display&&(page.display!=="plp"||!["grid","masonry"].includes(String(page.layout))))throw new PublicApiError(503,"invalid_response");
  return {...(display?{display,layout:page.layout as "grid"|"masonry"}:{}),items:page.items.map(v=>{const a=artwork(v);if(!display)return a;const raw=object(v);if(typeof raw.catalogLarge!=="boolean")throw new PublicApiError(503,"invalid_response");return {...a,catalogLarge:raw.catalogLarge};}),nextCursor:page.nextCursor,catalogRevision:page.catalogRevision,restarted};
}
