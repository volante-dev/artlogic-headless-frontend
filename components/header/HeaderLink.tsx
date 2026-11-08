'use client';
import Link from 'next/link';
import {useArtworkNavigation} from '../artworks/ArtworkNavigationContext';
import type {ComponentProps} from 'react';
import {useScopedHref,FreshLink} from '../FreshLink';
import {useSiteContent} from '../SiteContentProvider';
import {hasContactDraft} from '../../lib/contact/client';
import {destination} from '../../lib/header/navigation-state';
import {useHeaderNavigation} from './HeaderNavigationProvider';
export function HeaderLink({href,onAccepted,...props}:Omit<ComponentProps<typeof Link>,'href'>&{href:string;onAccepted?:()=>void}){
 const target=useScopedHref(href),site=useSiteContent(),navigation=useHeaderNavigation(),artwork=useArtworkNavigation();
 if(site.scope==='preview'||!navigation)return <FreshLink {...props} href={target}/>;
 return <Link {...props} href={target} prefetch={false} onNavigate={event=>{
  const next=destination(target,location.href);if(!next){event.preventDefault();return;}if(next.kind==='external')return;if(next.kind==='same-document'){onAccepted?.();return;}
  if(hasContactDraft()&&!window.confirm(site.messages['contact.leaveConfirm'])){event.preventDefault();return;}
  navigation.begin(next.href);artwork?.leaveForHeader?.();onAccepted?.();
 }}/>;
}
