'use client';
import {useRef,useState,useEffect,useSyncExternalStore,type ReactNode,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {ArtworkTypeFilters as FilterData} from '../../lib/artworks/types';
import {useSiteContent} from '../SiteContentProvider';
import {DRAWER_QUERY,useArtworkTypeFilterMotion} from './useArtworkTypeFilterMotion';
import styles from './ArtworkTypeFilters.module.css';
import {FilterCount} from './FilterCount';
interface Props {id:string;formId:string;data?:FilterData;selected:number[];onToggle:(id:number)=>void;onClear:()=>void;toolbar:(trigger:ReactNode)=>ReactNode}
export function ArtworkTypeFilters({id,formId,data,selected,onToggle,onClear,toolbar}:Props){
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false),[notice,setNotice]=useState('');const {locale,messages:m}=useSiteContent();
 useArtworkTypeFilterMotion(root,open);
 const available=data?.availability==='ready',options=[...(data?.options??[])].sort((a,b)=>a.name.localeCompare(b.name,locale)||a.id-b.id);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();setOpen(false);trigger.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
 useEffect(()=>{if(!open||!isDrawer())return;const html=document.documentElement,body=document.body,before=[html.style.overflow,body.style.overflow];html.style.overflow='hidden';body.style.overflow='hidden';const frame=requestAnimationFrame(()=>root.current?.querySelector<HTMLElement>('[data-type-close]')?.focus({preventScroll:true}));return()=>{cancelAnimationFrame(frame);[html.style.overflow,body.style.overflow]=before;};},[open]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 const trap=(event:ReactKeyboardEvent)=>{if(event.key!=='Tab'||!open||!isDrawer())return;const panel=root.current?.querySelector<HTMLElement>('[data-type-panel]'),items=[...panel?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])')??[]];if(!items.length)return;const first=items[0]!,last=items.at(-1)!;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}};
 return <div ref={root} className={styles.root} data-open={open} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();close();}trap(event);}}>
  {toolbar(<button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls={id} aria-label={m['gallery.typeFilters']} onClick={()=>{if(open)close();else setOpen(true);}}><span className={styles.burger} aria-hidden="true"><i/><i/></span><FilterCount count={selected.length}/></button>)}
  <div className={styles.scrim} data-type-scrim aria-hidden="true" onClick={close}/>
  <div id={id} className={styles.panel} data-type-panel inert={!open} aria-hidden={!open} aria-label={m['gallery.typeFilters']} role="region">
   <div className={styles.content} data-type-content>
    <button type="button" className={styles.close} data-type-close aria-label={m['editorial.close']} onClick={close}><span className={styles.burger} aria-hidden="true"><i/><i/></span></button>
    <div className={styles.panelHeading}><span>{m['gallery.typeHeading']}</span><button type="button" disabled={!selected.length} onClick={onClear}>{m['gallery.typeClear']}</button></div>
    {available?<fieldset className={styles.options}><legend className={styles.sr}>{m['gallery.typeHeading']}</legend>{options.map(type=><label key={type.id} data-type-option className={styles.option}><input type="checkbox" form={formId} name="types" value={type.id} disabled={!enhanced} checked={selected.includes(type.id)} onChange={()=>{if(!selected.includes(type.id)&&selected.length>=100){setNotice(m['gallery.typeLimit']);return;}setNotice('');onToggle(type.id);}}/><span>{type.name}</span></label>)}{!options.length&&<p>{m['gallery.typeEmpty']}</p>}</fieldset>:<p>{m['gallery.typeUnavailable']}</p>}
    <span role="status" className={styles.sr}>{notice||data?.normalized?notice||m['gallery.typeNormalized']:''}</span>
   </div>
  </div>
  <noscript><style>{`.${styles.trigger}{display:none}`}</style>{available&&<fieldset className={styles.options}><legend>{m['gallery.typeHeading']}</legend>{options.map(type=><label key={type.id} className={styles.option}><input type="checkbox" form={formId} name="types" value={type.id} defaultChecked={selected.includes(type.id)}/><span>{type.name}</span></label>)}</fieldset>}</noscript>
 </div>;
}

function subscribe(){return ()=>undefined;}
function isDrawer(){return matchMedia(DRAWER_QUERY).matches;}
