import {Suspense} from 'react';
import {OrderTracking} from '@/components/commerce/OrderTracking';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {loadConfig,stringValue} from '@/lib/config/env';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:(locale==='fr'?'Suivi de commande':'Order tracking')+' | '+stringValue(loadConfig(),'SITE_NAME'),description:locale==='fr'?'Consultez les étapes de préparation et de livraison de votre commande.':'Check the preparation and delivery status of your order.',robots:{index:false,follow:false},alternates:{canonical:null}};}
async function Content(){return <><OrderTracking/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
export default function Page(){return <Suspense><Content/></Suspense>;}
