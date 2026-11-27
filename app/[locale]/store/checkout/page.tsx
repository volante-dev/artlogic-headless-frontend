import {storePageMetadata} from '@/lib/commerce/metadata';
import {Suspense} from 'react';
import {connection} from 'next/server';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadStoreCapabilities,loadStoreCheckoutOptions} from '@/lib/commerce/catalog';
import {Checkout} from '@/components/commerce/Checkout';
export async function generateMetadata(){const site=await loadSiteContent();return {...storePageMetadata('checkout',site),robots:{index:false,follow:false},alternates:{canonical:null}};}
async function Content(){
 await connection();const site=await loadSiteContent(),capabilities=await loadStoreCapabilities(site.locale);
 return <>{capabilities.checkoutReady?<Checkout options={await loadStoreCheckoutOptions()} termsHref={capabilities.legalLinks.terms}/>:<p>{site.messages['commerce.salesSuspended']}</p>}<HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
export default function Page(){return <Suspense><Content/></Suspense>;}
