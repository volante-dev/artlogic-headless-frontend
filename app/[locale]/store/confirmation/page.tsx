import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {storePageMetadata} from '@/lib/commerce/metadata';
import {Suspense} from 'react';
import {connection} from 'next/server';
import {notFound} from 'next/navigation';
import {OrderConfirmation} from '@/components/commerce/OrderConfirmation';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
export async function generateMetadata(){const site=await loadSiteContent();return {...storePageMetadata('confirmation',site),robots:{index:false,follow:false},alternates:{canonical:null}};}
async function Content({query}:{query:Promise<{attempt?:string}>}){
 await connection();const {attempt}=await query;if(typeof attempt!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attempt))notFound();
 return <><OrderConfirmation attemptId={attempt}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
export default function Page({searchParams}:{searchParams:Promise<{attempt?:string}>}){return <Suspense><Content query={searchParams}/></Suspense>;}
