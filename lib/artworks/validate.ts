import type {GalleryArtwork,GalleryCatalog,GalleryExperience,GalleryPreviewExperience} from "./types";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$/;
function fail():never{throw new Error("invalid_gallery_response");}
function record(value:unknown,keys:readonly string[]):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))fail();const v=value as Record<string,unknown>;if(Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail();return v;}
function id(v:unknown):string{if(typeof v!=="string"||!uuid.test(v))fail();return v;}
function integer(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER):number{if(typeof v!=="number"||!Number.isSafeInteger(v)||v<min||v>max)fail();return v;}
function text(v:unknown):string|null{if(v===null||typeof v==="string")return v;return fail();}
export function parseGalleryArtwork(value:unknown):GalleryArtwork{
 const a=record(value,["id","slug","title","artist","year","medium","dimensions","media"]),artworkId=id(a.id);
 if(typeof a.slug!=="string"||a.slug.length>113||!slug.test(a.slug)||!a.slug.endsWith(artworkId.replaceAll("-","").toLowerCase())||!Array.isArray(a.media))fail();
 return {id:artworkId,slug:a.slug,title:text(a.title),artist:text(a.artist),year:text(a.year),medium:text(a.medium),dimensions:text(a.dimensions),media:a.media.map(value=>{const m=record(value,["id","alt","width","height","path"]),mediaId=id(m.id);if(m.path!=="/v1/public/media/"+mediaId)fail();return {id:mediaId,alt:text(m.alt),width:integer(m.width,1),height:integer(m.height,1),path:m.path as string};})};
}
export function parseGalleryCatalog(value:unknown):GalleryCatalog{
 const p=record(value,["items","query","page","pageSize","totalItems","pageCount","catalogRevision"]);if(!Array.isArray(p.items)||typeof p.query!=="string"||Array.from(p.query).length>160||p.query!==p.query.normalize("NFC").trim())fail();
 const page=integer(p.page,1,1000000),pageSize=integer(p.pageSize,1,100),totalItems=integer(p.totalItems),pageCount=integer(p.pageCount),catalogRevision=integer(p.catalogRevision);
 if(pageCount!==Math.ceil(totalItems/pageSize)||page>Math.max(1,pageCount)||p.items.length!==Math.min(pageSize,Math.max(0,totalItems-(page-1)*pageSize)))fail();
 return {items:p.items.map(parseGalleryArtwork),query:p.query,page,pageSize,totalItems,pageCount,catalogRevision};
}
export function parseGalleryExperience(value:unknown):GalleryExperience{
 const d=record(value,["scope","artwork","locale","description","descriptionLocale","presentationReleaseId","catalogRevision"]);
 if(d.scope!=="public"||typeof d.locale!=="string"||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(d.locale))fail();
 const description=text(d.description),descriptionLocale=text(d.descriptionLocale),release=d.presentationReleaseId===null?null:id(d.presentationReleaseId);
 if(description===null?descriptionLocale!==null:!description.trim()||Array.from(description).length>5000||!descriptionLocale||!release)fail();
 return {scope:"public",artwork:parseGalleryArtwork(d.artwork),locale:d.locale,description,descriptionLocale,presentationReleaseId:release,catalogRevision:integer(d.catalogRevision)};
}
export function parseGalleryPreviewExperience(value:unknown):GalleryPreviewExperience{
 const d=record(value,["scope","artwork","locale","description","descriptionLocale","snapshotId","revision","catalogRevision"]);
 if(d.scope!=="preview"||typeof d.locale!=="string"||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(d.locale)||typeof d.revision!=="string"||!/^[1-9][0-9]{0,19}$/.test(d.revision))fail();
 const description=text(d.description),descriptionLocale=text(d.descriptionLocale);
 if(description===null?descriptionLocale!==null:!description.trim()||Array.from(description).length>5000||!descriptionLocale||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(descriptionLocale))fail();
 return {scope:"preview",artwork:parseGalleryArtwork(d.artwork),locale:d.locale,description,descriptionLocale,snapshotId:id(d.snapshotId),revision:d.revision,catalogRevision:integer(d.catalogRevision)};
}
