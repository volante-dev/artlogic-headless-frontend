'use client';
import {useSiteContent} from '../SiteContentProvider';
import {linkInBioMessages} from '@/lib/link-in-bio/messages';
import type {Schemas} from '@/lib/link-in-bio/contracts';
import {LinkInBioDestination} from './LinkInBioGrid';
import styles from './LinkInBio.module.css';
export function LinkBanners({banners,locale,onLeave}:{banners:Schemas['LibPublicBanner'][];locale:string;onLeave:()=>void}){
 const {messages:siteMessages}=useSiteContent();
 if(!banners.length)return null;
 return <nav className={styles.banners} aria-label={linkInBioMessages(locale,siteMessages).featured}>{banners.map(banner=><LinkInBioDestination key={banner.id} destination={banner.destination} onLeave={onLeave}><span>{banner.label}</span><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1"/></svg></LinkInBioDestination>)}</nav>;
}
