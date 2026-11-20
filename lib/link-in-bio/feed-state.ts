import type {Schemas} from './contracts';
export interface LinkInBioFeedSnapshot {feed:Schemas['LibPublicFeed'];loading:boolean;error:'network'|'changed'|null}
export function createLinkInBioFeedState(initial:Schemas['LibPublicFeed']){
 let snapshot:LinkInBioFeedSnapshot={feed:initial,loading:false,error:null};const listeners=new Set<()=>void>();
 const commit=(next:LinkInBioFeedSnapshot)=>{snapshot=next;for(const listener of listeners)listener();};
 return {
  read:()=>snapshot,server:()=>({feed:initial,loading:false,error:null} as LinkInBioFeedSnapshot),
  subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>listeners.delete(listener);},
  pending:()=>commit({...snapshot,loading:true,error:null}),
  failure:(error:'network'|'changed')=>commit({...snapshot,loading:false,error}),
  replace:(feed:Schemas['LibPublicFeed'])=>commit({feed,loading:false,error:null}),
  append:(page:Schemas['LibPublicFeed'])=>{
   const current=snapshot.feed;
   if(page.siteId!==current.siteId||page.locale!==current.locale||page.releaseId!==current.releaseId||page.revision!==current.revision)throw Error('feed_changed');
   const known=new Set(current.items.map(item=>item.id));if(page.sourceState!=='suspended'&&page.items.some(item=>known.has(item.id)))throw Error('feed_changed');
   commit({feed:{...page,items:page.sourceState==='suspended'?[]:[...current.items,...page.items]},loading:false,error:null});
  },
 };
}
