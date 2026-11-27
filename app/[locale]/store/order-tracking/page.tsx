import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {storePageMetadata} from '@/lib/commerce/metadata';
import {Suspense} from 'react';
import {OrderTracking} from '@/components/commerce/OrderTracking';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
export async function generateMetadata(){const site=await loadSiteContent();return {...storePageMetadata('tracking',site),robots:{index:false,follow:false},alternates:{canonical:null}};}
async function Content(){return <><OrderTracking/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
export default function Page(){return <Suspense><Content/></Suspense>;}
