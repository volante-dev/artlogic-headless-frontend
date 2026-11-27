import {runtimeText} from '@/lib/i18n/site-messages';
import {storePageMetadata} from '@/lib/commerce/metadata';
import {Suspense} from 'react';
import {connection} from 'next/server';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadStoreCatalog} from '@/lib/commerce/catalog';
import {pageAlternates} from '@/lib/seo/metadata';
import {ProductCard} from '@/components/commerce/ProductCard';
import {HeaderLink} from '@/components/header/HeaderLink';
import {localizedPath} from '@/lib/i18n/routes';
import styles from '@/components/commerce/Store.module.css';
export async function generateMetadata(){const site=await loadSiteContent();return {...storePageMetadata('catalog',site),alternates:pageAlternates('/store',site.locale,site.policy,site.siteOrigin)};}
async function Content({query}:{query:Promise<{cursor?:string}>}){
 await connection();const site=await loadSiteContent(),params=await query,catalog=await loadStoreCatalog(site.locale,typeof params.cursor==='string'?params.cursor:undefined);
 return <>{!catalog.items.length&&<meta name='robots' content='noindex, follow'/>}<div className={styles.grid}>{catalog.items.map((p,index)=><ProductCard key={p.id} product={p} eager={index<2}/>)}</div>{!catalog.items.length&&<p className={styles.empty}>{runtimeText(site.messages,site.locale,'store.catalog.empty')}</p>}{catalog.nextCursor&&<div className={styles.more}><HeaderLink className='button' href={localizedPath('/store',site.locale,site.policy.defaultLocale)+'?'+new URLSearchParams({cursor:catalog.nextCursor})}>{runtimeText(site.messages,site.locale,'store.catalog.more')}</HeaderLink></div>}<HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
export default function Page({searchParams}:{searchParams:Promise<{cursor?:string}>}){return <Suspense><Content query={searchParams}/></Suspense>;}
