import {Suspense} from 'react';
import {connection} from 'next/server';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadStoreCapabilities,loadStoreCheckoutOptions} from '@/lib/commerce/catalog';
import {Checkout} from '@/components/commerce/Checkout';
import {loadConfig,stringValue} from '@/lib/config/env';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params,config=loadConfig();return {title:(locale==='fr'?'Commander':'Checkout')+' | '+stringValue(config,'SITE_NAME'),description:locale==='fr'?'Votre commande invitée, livraison et paiement sécurisé.':'Your guest order, delivery and secure payment.',robots:{index:false,follow:false},alternates:{canonical:null}};}
async function Content(){
 await connection();const site=await loadSiteContent(),capabilities=await loadStoreCapabilities(site.locale);
 return <>{capabilities.checkoutReady?<Checkout options={await loadStoreCheckoutOptions()} termsHref={capabilities.legalLinks.terms}/>:<p>{site.messages['commerce.salesSuspended']}</p>}<HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
export default function Page(){return <Suspense><Content/></Suspense>;}
