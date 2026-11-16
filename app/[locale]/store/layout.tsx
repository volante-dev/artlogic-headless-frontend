import {Suspense} from 'react';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadConfig,stringValue} from '@/lib/config/env';
import {loadStoreCapabilities,loadStoreCatalog} from '@/lib/commerce/catalog';
import {CartProvider} from '@/components/commerce/CartProvider';
import {StoreSubheader} from '@/components/commerce/StoreSubheader';
import styles from '@/components/commerce/Store.module.css';
async function StoreLayout({children}:{children:React.ReactNode}){
 const site=await loadSiteContent(),config=loadConfig(),capabilities=await loadStoreCapabilities(site.locale),path=(await headers()).get('x-site-path')??'/store',sales=config.COMMERCE_ENABLED==='true'&&capabilities.enabled;
 if(!sales&&!['/store/confirmation','/store/order-tracking','/store/withdrawal'].includes(path))notFound();
 const products=sales?(await loadStoreCatalog(site.locale)).items:[];
 return <CartProvider salesEnabled={sales} siteId={stringValue(config,'SITE_ID')} initialProducts={products} checkoutReady={sales&&capabilities.checkoutReady}><div className={styles.store}><StoreSubheader siteName={site.siteName}/>{children}</div></CartProvider>;
}
export default function Layout({children}:{children:React.ReactNode}){return <Suspense><StoreLayout>{children}</StoreLayout></Suspense>;}
