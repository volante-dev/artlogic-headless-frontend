import type {FormDocument,FormField} from './model.generated';
import type {FormRuntimeValues} from './resolver';
import {visibleFormFields} from './conditions.generated';
import type {PublicContactArtwork} from '../contact/types';

export interface ContactIdentity {name?:string;firstName?:string;lastName?:string;email?:string}
type Role=keyof ContactIdentity|'subject'|'message';
const key='artlogic:contact-identity:v1';
const normalize=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[-_]/g,' ').replace(/\s+/g,' ').trim();
const labels={firstName:['prenom','first name','given name'],lastName:['nom de famille','last name','surname','family name'],name:['nom complet','nom et prenom','nom prenom','full name'],subject:['sujet','objet','subject'],message:['message','votre message','your message','message general','general message']};
function bindings(document:FormDocument){
 const candidates=new Map<Role,FormField[]>(),hasFirst=document.fields.some(f=>f.type==='shortText'&&Object.values(f.translations).some(t=>labels.firstName.includes(normalize(t.label))));
 for(const field of document.fields){
  const names=Object.values(field.translations).map(t=>normalize(t.label));let role:Role|undefined;
  if(field.type==='email'&&(field.id===document.contactEmailFieldId||!document.contactEmailFieldId&&document.fields.filter(f=>f.type==='email').length===1))role='email';
  else if(field.type==='shortText'||field.type==='longText'){
   role=(Object.keys(labels) as (keyof typeof labels)[]).find(r=>labels[r].some(label=>names.includes(label)));
   if(!role&&names.some(n=>n==='nom'||n==='name'))role=hasFirst?'lastName':'name';
   if(field.type==='longText'&&role!=='message')role=undefined;
  }
  if(role)candidates.set(role,[...(candidates.get(role)??[]),field]);
 }
 // Ambiguous/custom fields stay empty; no positional or fuzzy guesses.
 return new Map([...candidates].filter(([,fields])=>fields.length===1).map(([role,fields])=>[role,fields[0]!]));
}
function clean(value:unknown):ContactIdentity|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;const source=value as Record<string,unknown>,result:ContactIdentity={};
 for(const role of ['name','firstName','lastName','email'] as const){const item=source[role];if(typeof item==='string'&&item.trim()&&item.length<=(role==='email'?254:256)&&!/[\r\n\0]/.test(item))result[role]=item.trim();}
 return result.email&&/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(result.email)?result:null;
}
export function readContactIdentity(storage?:Pick<Storage,'getItem'>):ContactIdentity|null{try{const raw=(storage??sessionStorage).getItem(key);return raw&&raw.length<=4096?clean(JSON.parse(raw)):null;}catch{return null;}}
export function saveContactIdentity(identity:ContactIdentity,storage?:Pick<Storage,'setItem'>){try{const value=clean(identity);if(value)(storage??sessionStorage).setItem(key,JSON.stringify(value));}catch{/* Remembering identity must never affect a confirmed request. */}}
export function formContactIdentity(document:FormDocument,answers:Record<string,unknown>):ContactIdentity{
 const identity:ContactIdentity={};for(const [role,field]of bindings(document))if(['name','firstName','lastName','email'].includes(role)&&typeof answers[field.id]==='string')identity[role as keyof ContactIdentity]=answers[field.id] as string;
 if(!identity.name&&(identity.firstName||identity.lastName))identity.name=[identity.firstName,identity.lastName].filter(Boolean).join(' ');return identity;
}
export function artworkInquiryCopy(artwork:Pick<PublicContactArtwork,'title'|'artist'>|null|undefined,locale:string,subjectLabel:string){
 if(!artwork)return {subject:'',message:''};const title=artwork.title.trim(),identity=title+(artwork.artist?.trim()?` (${artwork.artist.trim()})`:'');
 return {subject:Array.from(`${subjectLabel} : ${title}`).slice(0,160).join(''),message:locale.startsWith('fr')?`Bonjour,\n\nJe souhaiterais obtenir davantage d’informations concernant l’œuvre « ${identity} ».\n\nMerci.`:`Hello,\n\nI would like more information about the artwork “${identity}”.\n\nThank you.`};
}
export function prefillContactAnswers(document:FormDocument,answers:FormRuntimeValues['answers'],identity:ContactIdentity|null,artwork:Pick<PublicContactArtwork,'title'|'artist'>|null|undefined,locale:string,subjectLabel:string){
 const result={...answers},defaults={...identity,...artworkInquiryCopy(artwork,locale,subjectLabel)},visible=new Set(visibleFormFields(document,answers));
 for(const [role,field]of bindings(document)){const value=defaults[role];if(!visible.has(field.id)||typeof value!=='string'||!value||result[field.id]!==undefined&&result[field.id]!=='')continue;result[field.id]=Array.from(value).slice(0,field.constraints.maxLength??(role==='message'?20000:256)).join('');}
 return result;
}
