'use client';
import {useHeaderNavigation} from './HeaderNavigationProvider';
import {useSiteContent} from '../SiteContentProvider';
import {SiteLoading} from '../SiteLoading';
export function HeaderNavigationError(){
 const navigation=useHeaderNavigation(),{messages}=useSiteContent();if(!navigation||navigation.status==='ready')return null;
 if(navigation.status!=='error')return <SiteLoading navigation/>;
 return <div role="alert" data-header-status style={{position:'fixed',top:'var(--site-header-height, 100px)',left:'1rem',right:'1rem',zIndex:4,padding:'1rem',background:'var(--site-color-background)',color:'var(--site-color-text)'}}>{messages['error.presentationMessage']} <button type="button" onClick={navigation.retry}>{messages['catalog.retry']}</button></div>;
}
