'use client';
import {useRef,useState,useEffect,useSyncExternalStore,type ReactNode} from 'react';
import type {ArtworkTypeFilters as FilterData} from '../../lib/artworks/types';
import {useSiteContent} from '../SiteContentProvider';
import {useArtworkTypeFilterMotion} from './useArtworkTypeFilterMotion';
import styles from './ArtworkTypeFilters.module.css';
interface Props {id:string;formId:string;data?:FilterData;selected:number[];onToggle:(id:number)=>void;onClear:()=>void;toolbar:(trigger:ReactNode)=>ReactNode}
export function ArtworkTypeFilters({id,formId,data,selected,onToggle,onClear,toolbar}:Props){
 const enhanced=useSyncExternalStore(subscribe,()=>true,()=>false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false),[notice,setNotice]=useState('');const {locale,messages:m}=useSiteContent();
 useArtworkTypeFilterMotion(root,open);
 const available=data?.availability==='ready',options=[...(data?.options??[])].sort((a,b)=>a.name.localeCompare(b.name,locale)||a.id-b.id);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();setOpen(false);trigger.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 return <div ref={root} className={styles.root} data-open={open} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();close();}}}>
  {toolbar(<button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls={id} aria-label={m['gallery.typeFilters']} onClick={()=>{if(open)close();else setOpen(true);}}><span className={styles.burger} aria-hidden="true"><i/><i/></span><span className={styles.label}>{m['gallery.typeFilters']}</span>{selected.length>0&&<span className={styles.count}>{selected.length}</span>}</button>)}
  <div id={id} className={styles.panel} data-type-panel inert={!open} aria-hidden={!open}>
   <div className={styles.content} data-type-content>
    <div className={styles.panelHeading}><span>{m['gallery.typeHeading']}</span><button type="button" disabled={!selected.length} onClick={onClear}>{m['gallery.typeClear']}</button></div>
    {available?<fieldset className={styles.options}><legend className={styles.sr}>{m['gallery.typeHeading']}</legend>{options.map(type=><label key={type.id} data-type-option className={styles.option}><input type="checkbox" form={formId} name="types" value={type.id} disabled={!enhanced} checked={selected.includes(type.id)} onChange={()=>{if(!selected.includes(type.id)&&selected.length>=100){setNotice(m['gallery.typeLimit']);return;}setNotice('');onToggle(type.id);}}/><span>{type.name}</span><span className={styles.check} aria-hidden="true">↗</span></label>)}{!options.length&&<p>{m['gallery.typeEmpty']}</p>}</fieldset>:<p>{m['gallery.typeUnavailable']}</p>}
    <span role="status" className={styles.sr}>{notice||data?.normalized?notice||m['gallery.typeNormalized']:''}</span>
   </div>
  </div>
  <noscript><style>{`.${styles.trigger}{display:none}`}</style>{available&&<fieldset className={styles.options}><legend>{m['gallery.typeHeading']}</legend>{options.map(type=><label key={type.id} className={styles.option}><input type="checkbox" form={formId} name="types" value={type.id} defaultChecked={selected.includes(type.id)}/><span>{type.name}</span></label>)}</fieldset>}</noscript>
 </div>;
}

function subscribe(){return ()=>undefined;}
