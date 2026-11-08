import type {MobileArtworkVisualSnapshot} from "../../lib/artworks/interaction";
export type MobileState=MobileArtworkVisualSnapshot&{epoch:number;transition:null|{fromId:string;toId:string;acceptedAt:number;duration:600;epoch:number}};
export type MobileEvent={type:"select";id:string;now:number}|{type:"commit";epoch:number}|{type:"information"|"gallery"|"finale"|"viewport"|"composition"}|{type:"examine";zoom:2}|{type:"pan";x:number;y:number}|{type:"reading"|"finale-reading";top:number};
const finite=(value:unknown,fallback=0)=>typeof value==="number"&&Number.isFinite(value)?value:fallback;
export const unit=(value:number)=>Math.max(-1,Math.min(1,value));
export function initialMobileState(artworkId:string,ids:readonly string[],scope:MobileState["scope"]="public"):MobileState{return {version:2,scope,artworkId,selectedMediaId:ids[0]??null,mode:"gallery",zoom:1,pan:{x:0,y:0},informationScrollTop:0,epoch:0,transition:null};}
export function stableSnapshot(s:MobileState):MobileArtworkVisualSnapshot{return {version:2,scope:s.scope,artworkId:s.artworkId,selectedMediaId:s.selectedMediaId,stage:s.mode==="finale"?{kind:"finale",anchorMediaId:s.selectedMediaId}:s.selectedMediaId?{kind:"photo",mediaId:s.selectedMediaId}:{kind:"overview"},mode:s.mode,zoom:s.zoom,pan:{...s.pan},informationScrollTop:s.informationScrollTop,finaleScrollTop:s.finaleScrollTop??0};}
export function reconcileMobile(input:unknown,artworkId:string,ids:readonly string[],scope:MobileState["scope"]="public"):MobileState{
 const base=initialMobileState(artworkId,ids,scope);if(!input||typeof input!=="object")return base;
 const s=input as Partial<MobileState>;
 if((s.version!==1&&s.version!==2)||s.scope!==scope||s.artworkId!==artworkId)return base;
 const exists=typeof s.selectedMediaId==="string"&&ids.includes(s.selectedMediaId);
 const mode=(s.version===2?["gallery","information","examine","finale"]:["gallery","information","examine"]).includes(s.mode??"")?s.mode!:"gallery";
 return {...base,selectedMediaId:exists?s.selectedMediaId!:mode==="finale"?ids.at(-1)??null:ids[0]??null,mode:mode==="examine"&&(!exists||s.zoom!==2)?"gallery":mode,zoom:exists&&s.zoom===2?2:1,pan:exists?{x:unit(finite(s.pan?.x)),y:unit(finite(s.pan?.y))}:{x:0,y:0},informationScrollTop:Math.max(0,finite(s.informationScrollTop)),finaleScrollTop:Math.max(0,finite(s.finaleScrollTop)),epoch:Math.max(0,Math.trunc(finite(s.epoch)))+1};
}
export function mobileTransition(s:MobileState,event:MobileEvent,ids:readonly string[]):MobileState{
 if(event.type==="select"){
  if(s.mode!=="gallery"||s.transition||event.id===s.selectedMediaId||!ids.includes(event.id)||!s.selectedMediaId)return s;
  const epoch=s.epoch+1;return {...s,epoch,selectedMediaId:event.id,zoom:1,pan:{x:0,y:0},transition:{fromId:s.selectedMediaId,toId:event.id,acceptedAt:event.now,duration:600,epoch}};
 }
 if(event.type==="commit")return s.transition?.epoch===event.epoch?{...s,transition:null}:s;
 if(event.type==="finale-reading")return {...s,finaleScrollTop:Math.max(0,finite(event.top))};
 if(event.type==="reading")return {...s,informationScrollTop:Math.max(0,finite(event.top))};
 if(event.type==="pan")return s.mode==="examine"?{...s,pan:{x:unit(finite(event.x)),y:unit(finite(event.y))}}:s;
 const settled={...s,transition:null,epoch:s.epoch+1};
 if(event.type==="composition")return {...settled,mode:s.mode==="finale"?"finale":"gallery",zoom:1,pan:{x:0,y:0}};
 if(event.type==="viewport")return settled;
 if(event.type==="finale")return s.mode==="finale"?s:{...settled,mode:"finale",zoom:1,pan:{x:0,y:0}};
 if(event.type==="information")return {...settled,mode:"information"};
 if(event.type==="gallery")return {...settled,mode:"gallery",zoom:1,pan:{x:0,y:0}};
 if(event.type==="examine"&&s.selectedMediaId)return {...settled,mode:"examine",zoom:event.zoom,pan:{x:0,y:0}};
 return s;
}
