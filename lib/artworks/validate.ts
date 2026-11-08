import {safeEditorialHref} from "../editorial/links";
import {Ajv2020} from "ajv/dist/2020.js";
import {gallerySchemas} from "./schemas.generated";
import {parseHeroFocus} from "./focus";
import type {GalleryArtwork,GalleryCatalog,GalleryExperience,GalleryPreviewExperience} from "./types";
const richValidator=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false}).compile(gallerySchemas.EditorialRichText);
const sourceKeys=["importedDescription","importedDescriptionLocale","importedProvenance","importedProvenanceLocale"] as const;
function sourceFields(value:unknown):Pick<GalleryExperience,typeof sourceKeys[number]>{
 const v=value as Record<string,unknown>,result:Record<string,unknown>={};
 for(const field of ["importedDescription","importedProvenance"] as const){
  const doc=v[field]??null,locale=v[field+"Locale"]??null;
  if(locale!==null&&(typeof locale!=="string"||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale)))fail();
  if(doc===null&&locale!==null||doc!==null&&field==="importedDescription"&&locale===null)fail();
  if(doc!==null){
   const stack:{node:unknown;depth:number}[]=[{node:doc,depth:0}];let count=0,points=0;
   while(stack.length){const {node,depth}=stack.pop()!;if(++count>10000||depth>16||!node||typeof node!=="object")fail();const n=node as {text?:string;content?:unknown[];marks?:{type:string;attrs?:{href?:unknown}}[]};
    if(typeof n.text==="string")points+=Array.from(n.text).length;if(points>50000)fail();
    if(n.content!==undefined){if(!Array.isArray(n.content))fail();for(const child of n.content)stack.push({node:child,depth:depth+1});}
    if(n.marks!==undefined){if(!Array.isArray(n.marks))fail();for(const mark of n.marks)if(mark.type==="link"&&!(typeof mark.attrs?.href==="string"&&safeEditorialHref(mark.attrs.href)))fail();}
   }
   if(!richValidator(doc))fail();
  }
  result[field]=doc;result[field+"Locale"]=locale;
 }
 return result as Pick<GalleryExperience,typeof sourceKeys[number]>;
}
function presentSourceKeys(value:unknown){return value&&typeof value==="object"?sourceKeys.filter(key=>Object.hasOwn(value,key)):[];}
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
export function parseGalleryCatalog(value:unknown,plp=false):GalleryCatalog{
 const p=record(value,["items","query","page","pageSize","totalItems","pageCount","catalogRevision",...(plp?["display","layout"]:[])]);if(!Array.isArray(p.items)||typeof p.query!=="string"||Array.from(p.query).length>160||p.query!==p.query.normalize("NFC").trim())fail();
 const page=integer(p.page,1,1000000),pageSize=integer(p.pageSize,1,100),totalItems=integer(p.totalItems),pageCount=integer(p.pageCount),catalogRevision=integer(p.catalogRevision);
 if(pageCount!==Math.ceil(totalItems/pageSize)||page>Math.max(1,pageCount)||p.items.length!==Math.min(pageSize,Math.max(0,totalItems-(page-1)*pageSize)))fail();
 if(plp&&(p.display!=="plp"||!["grid","masonry"].includes(String(p.layout))))fail();
 const items=p.items.map(v=>{if(!plp)return parseGalleryArtwork(v);const a=record(v,["id","slug","title","artist","year","medium","dimensions","media","catalogLarge"]);if(typeof a.catalogLarge!=="boolean")fail();const {catalogLarge,...base}=a;return {...parseGalleryArtwork(base),catalogLarge};});
 return {...(plp?{display:"plp" as const,layout:p.layout as "grid"|"masonry"}:{}),items,query:p.query,page,pageSize,totalItems,pageCount,catalogRevision};
}
export function parseGalleryExperience(value:unknown):GalleryExperience{
 const d=record(value,["scope","artwork","locale","description","descriptionLocale","presentationReleaseId","catalogRevision",...presentSourceKeys(value),...(value&&typeof value==="object"&&Object.hasOwn(value,"heroFocus")?["heroFocus"]:[])]);
 if(d.scope!=="public"||typeof d.locale!=="string"||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(d.locale))fail();
 const description=text(d.description),descriptionLocale=text(d.descriptionLocale),release=d.presentationReleaseId===null?null:id(d.presentationReleaseId);
 if(description===null?descriptionLocale!==null:!description.trim()||Array.from(description).length>5000||!descriptionLocale||!release)fail();
 const art=parseGalleryArtwork(d.artwork);
 return {...sourceFields(d),heroFocus:parseHeroFocus(d.heroFocus,art.media[0]?.id),scope:"public",artwork:art,locale:d.locale,description,descriptionLocale,presentationReleaseId:release,catalogRevision:integer(d.catalogRevision)};
}
export function parseGalleryPreviewExperience(value:unknown):GalleryPreviewExperience{
 const d=record(value,["scope","artwork","locale","description","descriptionLocale","snapshotId","revision","catalogRevision",...presentSourceKeys(value),...(value&&typeof value==="object"&&Object.hasOwn(value,"heroFocus")?["heroFocus"]:[])]);
 if(d.scope!=="preview"||typeof d.locale!=="string"||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(d.locale)||typeof d.revision!=="string"||!/^[1-9][0-9]{0,19}$/.test(d.revision))fail();
 const description=text(d.description),descriptionLocale=text(d.descriptionLocale);
 if(description===null?descriptionLocale!==null:!description.trim()||Array.from(description).length>5000||!descriptionLocale||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(descriptionLocale))fail();
 const art=parseGalleryArtwork(d.artwork);
 return {...sourceFields(d),heroFocus:parseHeroFocus(d.heroFocus,art.media[0]?.id),scope:"preview",artwork:art,locale:d.locale,description,descriptionLocale,snapshotId:id(d.snapshotId),revision:d.revision,catalogRevision:integer(d.catalogRevision)};
}
