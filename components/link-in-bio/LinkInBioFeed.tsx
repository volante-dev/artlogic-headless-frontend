'use client';
import {linkInBioMessages} from '@/lib/link-in-bio/messages';
import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {Schemas} from '@/lib/link-in-bio/contracts';
import {createLinkInBioFeedState} from '@/lib/link-in-bio/feed-state';
import {readLinkInBioPage} from '@/lib/link-in-bio/client';
import {LinkInBioGrid} from './LinkInBioGrid';
import {LinkBanners} from './LinkBanners';
import {LoadingIndicator} from '../SiteLoading';
import {useSiteContent} from '../SiteContentProvider';
import styles from './LinkInBio.module.css';
interface Saved {feed:Schemas['LibPublicFeed'];scroll:number;focus:string|null;at:number;pages:[string,string|null][]}
const saved=new Map<string,Saved>();
export function LinkInBioFeed({initial,cursor=null}:{initial:Schemas['LibPublicFeed'];cursor?:string|null}){
 const {defaultLocale}=useSiteContent();
 const [state]=useState(()=>createLinkInBioFeedState(initial));const initialSnapshot=useRef(state.read());
 const snapshot=useSyncExternalStore(state.subscribe,state.read,()=>initialSnapshot.current),feed=snapshot.feed,messages=linkInBioMessages(feed.locale);
 const active=useRef(true),controller=useRef<AbortController|null>(null),repairController=useRef<AbortController|null>(null),busy=useRef(false),entry=useRef<string|null>(null),pages=useRef(new Map(initial.items.map(item=>[item.id,cursor]))),repairs=useRef(new Map<string,Promise<Schemas['LibPublicFeed']>>());
 function remember(){if(!entry.current)return;const focus=document.activeElement?.closest('[data-link-bio-post]')?.getAttribute('data-link-bio-post')??null;saved.delete(entry.current);saved.set(entry.current,{feed:state.read().feed,scroll:window.scrollY,focus,at:Date.now(),pages:[...pages.current]});if(saved.size>4)saved.delete(saved.keys().next().value!);}
 useLayoutEffect(()=>{
  active.current=true;repairController.current=new AbortController();const href=location.pathname+location.search,existing=history.state?.__linkInBioEntry as {href:string;id:string}|undefined;
  const id=existing?.href===href&&typeof existing.id==='string'?existing.id:crypto.randomUUID();
  history.replaceState({...history.state,__linkInBioEntry:{href,id}},'');entry.current=[initial.siteId,initial.locale,initial.releaseId,initial.revision,id].join(':');
  const previous=saved.get(entry.current);
  if(previous&&Date.now()-previous.at<900000&&initial.sourceState!=='suspended'&&previous.feed.releaseId===initial.releaseId){state.replace(previous.feed);pages.current=new Map(previous.pages);requestAnimationFrame(()=>{window.scrollTo({top:previous.scroll,behavior:'instant'});if(previous.focus)document.querySelector<HTMLElement>('[data-link-bio-post="'+previous.focus+'"] a')?.focus({preventScroll:true});});}
  return ()=>{remember();active.current=false;controller.current?.abort();repairController.current?.abort();};
 // A route/release change remounts this component via LinkInBioRoute's key.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[state]);
 useEffect(()=>{const save=()=>remember();window.addEventListener('pagehide',save);return ()=>window.removeEventListener('pagehide',save);});
 async function more(restart=false){
  if(busy.current)return;busy.current=true;controller.current=new AbortController();state.pending();const after=restart?null:state.read().feed.nextCursor;
  try{const page=await readLinkInBioPage(initial.locale,after,controller.current.signal);if(!active.current)return;
   if(restart){pages.current.clear();state.replace(page);}else state.append(page);
   for(const item of page.items)pages.current.set(item.id,after);
  }catch(error){if(active.current)state.failure(error instanceof Error&&('code'in error&&error.code==='feed_changed'||error.message==='feed_changed')?'changed':'network');}
  finally{busy.current=false;}
 }
 async function recover(id:string){
  const after=pages.current.get(id)??null,key=after??'first';let promise=repairs.current.get(key);
  if(!promise){if(!repairController.current)return null;promise=readLinkInBioPage(initial.locale,after,repairController.current.signal).finally(()=>repairs.current.delete(key));repairs.current.set(key,promise);}
  const page=await promise,current=state.read().feed;if(!active.current||page.releaseId!==current.releaseId||page.siteId!==current.siteId)return null;
  if(page.sourceState==='suspended'){state.append(page);return null;}return page.items.find(item=>item.id===id)?.image??null;
 }
 return <section className={styles.page} lang={feed.locale}>
  <div className={styles.intro}><h1>{feed.title}</h1>{feed.description&&<p>{feed.description}</p>}</div>
  <LinkBanners banners={feed.banners} locale={feed.locale} onLeave={remember}/>
  {feed.items.length>0?<LinkInBioGrid items={feed.items} locale={feed.locale} recover={recover} onLeave={remember}/>:<p className={styles.empty}>{feed.sourceState==='suspended'?messages.suspended:messages.empty}</p>}
  <div className={styles.continuation} aria-busy={snapshot.loading} data-link-bio-continuation>
   {snapshot.error&&<p role="alert">{snapshot.error==='changed'?messages.changed:messages.network}</p>}
   {(feed.nextCursor||snapshot.error)&&<button type="button" disabled={snapshot.loading} onClick={()=>void more(snapshot.error==='changed')}>{snapshot.loading?<><LoadingIndicator compact decorative/><span>{messages.loading}</span></>:snapshot.error==='changed'?messages.reload:snapshot.error?messages.retry:messages.more}</button>}
   {feed.nextCursor&&<noscript><a href={(feed.locale===defaultLocale?'':'/'+feed.locale)+'/link-in-bio?cursor='+encodeURIComponent(feed.nextCursor)}>{messages.next}</a></noscript>}
  </div>
 </section>;
}
