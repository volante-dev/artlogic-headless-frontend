'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import type {Schemas} from '@/lib/link-in-bio/contracts';
import {HeaderLink} from '../header/HeaderLink';
import {PostThumbnail} from './PostThumbnail';
import styles from './LinkInBio.module.css';
export function LinkInBioDestination({destination,children,onLeave}:{destination:Schemas['LibDestination'];children:ReactNode;onLeave?:()=>void}){
 if(destination.external)return <a href={destination.href} target="_blank" rel="noopener noreferrer" aria-label={destination.label} onClick={onLeave}>{children}</a>;
 if(destination.kind==='artwork')return <Link href={destination.href} prefetch={false} scroll={false} aria-label={destination.label} onClick={onLeave}>{children}</Link>;
 return <HeaderLink href={destination.href} scroll={false} aria-label={destination.label} onClick={onLeave} onAccepted={()=>window.scrollTo({top:0,left:0,behavior:'instant'})}>{children}</HeaderLink>;
}
export function LinkInBioGrid({items,locale,recover,onLeave}:{items:Schemas['LibPublicItem'][];locale:string;recover:(id:string)=>Promise<Schemas['LibImage']|null>;onLeave:()=>void}){
 return <ol className={styles.grid} data-link-bio-grid>{items.map((item,index)=>{
  const image=<PostThumbnail item={item} locale={locale} priority={index<6} recover={recover}/>;
  return <li key={item.id} data-link-bio-post={item.id}>{item.destination?<LinkInBioDestination destination={item.destination} onLeave={onLeave}>{image}</LinkInBioDestination>:image}</li>;
 })}</ol>;
}
