export interface RattonArtworkVisitState {visitKey:string;artworkId:string;selectedMediaId:string|null;informationScrollTop:number;zoomMediaId:string|null;closing:boolean}
export function newRattonVisit(artworkId:string,ids:readonly string[],visitKey:string):RattonArtworkVisitState{return {visitKey,artworkId,selectedMediaId:ids[0]??null,informationScrollTop:0,zoomMediaId:null,closing:false};}
export function reconcileRattonVisit(state:RattonArtworkVisitState,ids:readonly string[]):RattonArtworkVisitState{
 const selectedMediaId=state.selectedMediaId&&ids.includes(state.selectedMediaId)?state.selectedMediaId:ids[0]??null;
 const zoomMediaId=state.zoomMediaId===selectedMediaId?state.zoomMediaId:null;
 return selectedMediaId===state.selectedMediaId&&zoomMediaId===state.zoomMediaId?state:{...state,selectedMediaId,zoomMediaId};
}
export function moveRattonPhoto(state:RattonArtworkVisitState,ids:readonly string[],delta:number):RattonArtworkVisitState{
 if(state.closing||state.zoomMediaId||!ids.length)return state;
 const index=Math.max(0,ids.indexOf(state.selectedMediaId??"")),next=Math.max(0,Math.min(ids.length-1,index+Math.trunc(delta)));
 return ids[next]===state.selectedMediaId?state:{...state,selectedMediaId:ids[next]!};
}
export function rattonPhotoWindow(ids:readonly string[],selected:string|null):string[]{if(!ids.length)return [];const i=Math.max(0,ids.indexOf(selected??""));return ids.slice(Math.max(0,i-1),i+2);}
export function createRattonVisitStore(artworkId:string,ids:readonly string[],visitKey:string){
 let state=newRattonVisit(artworkId,ids,visitKey);const listeners=new Set<()=>void>();
 const replace=(next:RattonArtworkVisitState)=>{if(next===state)return;state=next;for(const listener of listeners)listener();};
 return {read:()=>state,subscribe:(fn:()=>void)=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},reconcile:(nextIds:readonly string[])=>replace(reconcileRattonVisit(state,nextIds)),move:(nextIds:readonly string[],delta:number)=>replace(moveRattonPhoto(state,nextIds,delta)),patch:(patch:Partial<Pick<RattonArtworkVisitState,"informationScrollTop"|"zoomMediaId"|"closing">>)=>replace({...state,...patch,informationScrollTop:Math.max(0,patch.informationScrollTop??state.informationScrollTop)})};
}
