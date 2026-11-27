import {Ajv2020} from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {artworkAddressSchemas} from './artwork-address-schemas.generated';
import type {components} from './artwork-address-contract.generated';
import {parseGalleryCatalog,parseGalleryExperience} from './validate';
export type ArtworkAddress=components['schemas']['Address'];
export type ArtworkAddressSet=components['schemas']['AddressSet'];
export type ArtworkAddressResolution=components['schemas']['Resolution'];
export type ArtworkAddressCapability=components['schemas']['Capability'];
const ajv=new Ajv2020({strict:true,strictTypes:false,coerceTypes:false,removeAdditional:false});
(addFormats as unknown as (a:Ajv2020)=>void)(ajv);
const validators={set:ajv.compile(artworkAddressSchemas.AddressSet),resolution:ajv.compile(artworkAddressSchemas.Resolution),capability:ajv.compile(artworkAddressSchemas.Capability)};
const legacy=/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$/;
function fail():never{throw new Error('invalid_artwork_address_response');}
function validateAddress(a:ArtworkAddress,mode:'active'|'legacy'){
 const entries=[{locale:a.locale,slug:a.slug,path:a.canonicalPath},...a.alternates];
 const locales=new Set<string>();
 for(const e of entries){
  if(mode==='active'&&(e.slug.length>80||legacy.test(e.slug)||/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e.slug)))fail();
  if(mode==='legacy'&&(!legacy.test(e.slug)||!e.slug.endsWith(a.artworkId.replaceAll('-','').toLowerCase())))fail();
  if(e.path!=='/artworks/'+e.slug&&e.path!=='/'+e.locale+'/artworks/'+e.slug)fail();
 }
 for(const e of a.alternates){if(locales.has(e.locale))fail();locales.add(e.locale);if(e.locale===a.locale&&(e.path!==a.canonicalPath||e.slug!==a.slug))fail();}
}
export function parseArtworkAddressSet(value:unknown):ArtworkAddressSet{
 if(!validators.set(value))fail();const set=value as ArtworkAddressSet,ids=new Set<string>();
 for(const a of set.items){validateAddress(a,set.mode);if(ids.has(a.artworkId+':'+a.locale))fail();ids.add(a.artworkId+':'+a.locale);}return set;
}
export function parseArtworkAddressResolution(value:unknown):ArtworkAddressResolution{
 if(!validators.resolution(value))fail();const r=value as ArtworkAddressResolution;validateAddress(r.address,r.mode);
 if(r.decision==='canonical'?(r.redirect!==false||r.redirectStatus!==null||r.requestedLocale!==r.address.locale):r.redirect!==true||r.redirectStatus!==(r.decision==='locale_fallback'?307:308))fail();return r;
}
export function parseArtworkAddressCapability(value:unknown):ArtworkAddressCapability{
 if(!validators.capability(value))fail();const c=value as ArtworkAddressCapability;if(c.mode==='active'&&(!c.available||c.minimumContractVersion!==1))fail();if(!c.available&&(c.minimumContractVersion!==0||c.mode!=='legacy'||c.addressRevision!==null))fail();return c;
}
export function splitArtworkAddresses(value:unknown,expected?:boolean){
 if(!value||typeof value!=='object'||Array.isArray(value))fail();const {artworkAddresses,...body}=value as Record<string,unknown>;
 if(expected===true&&artworkAddresses===undefined||expected===false&&artworkAddresses!==undefined)fail();
 return {body,addresses:artworkAddresses===undefined?undefined:parseArtworkAddressSet(artworkAddresses)};
}
export function attachArtworkAddresses<T>(value:T,set?:ArtworkAddressSet):T{
 if(!set)return value;const map=new Map(set.items.map(a=>[a.artworkId,a]));
 const visit=(v:unknown):unknown=>Array.isArray(v)?v.map(visit):v&&typeof v==='object'?Object.fromEntries([...Object.entries(v).map(([k,x])=>[k,visit(x)]),...(typeof (v as {id?:unknown}).id==='string'&&map.has((v as {id:string}).id)?[['publicAddress',map.get((v as {id:string}).id)]]:[])]):v;
 return {...visit(value) as object,artworkAddresses:set} as T;
}
/** In-memory addresses stay outside the closed business DTO on the HTTP boundary. */
export function artworkAddressEnvelope(value:unknown):unknown{
 if(Array.isArray(value))return value.map(artworkAddressEnvelope);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>k!=='publicAddress').map(([k,v])=>[k,artworkAddressEnvelope(v)]));return value;
}
export function artworkAddressJsonResponse(value:unknown,base:HeadersInit,requested:boolean){
 const headers=new Headers(base),body=artworkAddressEnvelope(value);
 if(requested){const has=(v:unknown):boolean=>Array.isArray(v)?v.some(has):!!v&&typeof v==='object'&&(Object.hasOwn(v,'artworkAddresses')||Object.values(v).some(has));headers.set('X-Artwork-Address-Contract',has(body)?'1':'0');headers.set('Vary',[headers.get('Vary'),'X-Artwork-Address-Contract'].filter(Boolean).join(', '));headers.set('Cache-Control','private, no-store');}
 return Response.json(body,{headers});
}
export function parseAddressedCatalog(value:unknown,plp=false,expected?:boolean){const {body,addresses}=splitArtworkAddresses(value,expected),parsed=parseGalleryCatalog(body,plp);if(addresses&&(addresses.items.length!==parsed.items.length||parsed.items.some(a=>!addresses.items.some(b=>b.artworkId===a.id))))fail();return attachArtworkAddresses(parsed,addresses);}
export function parseAddressedExperience(value:unknown,expected?:boolean){const {body,addresses}=splitArtworkAddresses(value,expected);const parsed=parseGalleryExperience(body);if(addresses&&(addresses.items.length!==1||addresses.items[0]!.artworkId!==parsed.artwork.id||addresses.items[0]!.locale!==parsed.locale))fail();return attachArtworkAddresses(parsed,addresses);}
