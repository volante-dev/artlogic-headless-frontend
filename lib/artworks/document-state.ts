export type DocumentBootState='static'|'preparing'|'owned'|'cancelled';
export type DocumentBootEvent='waiting'|'claim'|'script-failed'|'hidden';
export function documentBootTransition(state:DocumentBootState,event:DocumentBootEvent):DocumentBootState{
 if(state!=='preparing')return state;
 if(event==='claim')return'owned';if(event==='script-failed')return'static';if(event==='hidden')return'cancelled';return state;
}
export function claimArtworkDocument(){
 const boot=(window as Window&{__artworkDocumentBoot?:{claim:()=>boolean}}).__artworkDocumentBoot;
 if(boot)return boot.claim();
 // A hard-load whose bootstrap was blocked keeps its real native reader. Soft
 // navigations have no parser bootstrap to replay and can adopt normally.
 const entry=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
 if(entry&&new URL(entry.name).pathname===location.pathname)return false;
 document.documentElement.dataset.artworkDocument='owned';return true;
}
