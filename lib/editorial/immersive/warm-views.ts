import type {EditorialView} from './build-views';
/** Only image views may mount ahead: no forms, players or embeds. */
export function isImageView(view:EditorialView):boolean{
 if(view.kind!=='block'||view.panel==='text')return false;
 const b=view.block,photo=(media:{source:{kind:string}|null}|undefined)=>media?.source?.kind==='image'||media?.source?.kind==='artwork';
 if(b.type==='media')return photo(b.media);
 if(b.type==='imageGroup')return b.items.length>0;
 if(b.type==='carousel')return b.slides.length>0&&b.slides.every(s=>photo(s.media));
 if(b.type==='textMedia')return photo(b.media)&&(!b.secondMedia||photo(b.secondMedia));
 return false;
}
export function warmImageViews(views:readonly EditorialView[],anchor:string,count=2):ReadonlySet<string>{
 const result=new Set<string>();if(count<=0)return result;for(const view of views.slice(Math.max(0,views.findIndex(v=>v.id===anchor))+1)){if(isImageView(view))result.add(view.id);if(result.size>=count)break;}return result;
}
