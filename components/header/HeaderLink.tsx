'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useArtworkNavigation} from '../artworks/ArtworkNavigationContext';
import type {ComponentProps} from 'react';
import {useScopedHref,FreshLink} from '../FreshLink';
import {useSiteContent} from '../SiteContentProvider';
import {hasContactDraft} from '../../lib/contact/client';
import {destination} from '../../lib/header/navigation-state';
import {useHeaderNavigation} from './HeaderNavigationProvider';
type HeaderLinkProps=Omit<ComponentProps<typeof Link>,'href'>&{href:string;onAccepted?:(generation?:number)=>void|Promise<boolean>};
export function HeaderLink({href,onAccepted,...props}:HeaderLinkProps){
 const target=useScopedHref(href),site=useSiteContent(),navigation=useHeaderNavigation();
 if(site.scope==='preview'||!navigation)return <FreshLink {...props} href={target}/>;
 return <PublicHeaderLink {...props} href={target} onAccepted={onAccepted} navigation={navigation}/>;
}
function PublicHeaderLink({href,onAccepted,navigation,...props}:HeaderLinkProps&{navigation:NonNullable<ReturnType<typeof useHeaderNavigation>>}){
 const site=useSiteContent(),artwork=useArtworkNavigation(),router=useRouter();
 return <Link {...props} href={href} prefetch={false} onNavigate={event=>{
  const next=destination(href,location.href);if(!next){event.preventDefault();return;}if(next.kind==='external')return;if(next.kind==='same-document'){onAccepted?.();return;}
  if(hasContactDraft()&&!window.confirm(site.messages['contact.leaveConfirm'])){event.preventDefault();return;}
  const generation=navigation.begin(next.href);artwork?.leaveForHeader?.();const feedback=onAccepted?.(generation);
  if(feedback){event.preventDefault();void feedback.then(complete=>{if(complete&&navigation.isCurrent(generation))router[props.replace?'replace':'push'](next.href,{scroll:props.scroll});}).catch(()=>{if(navigation.isCurrent(generation))navigation.fail();});}
 }}/>;
}
