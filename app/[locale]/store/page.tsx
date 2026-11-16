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
import {configuredLocalePolicy,loadConfig,stringValue} from '@/lib/config/env';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params,config=loadConfig(),name=stringValue(config,'SITE_NAME'),title=name+' Store',description=locale==='fr'?`Livres et objets proposés par ${name}.`:`Books and objects offered by ${name}.`;return {title,description,alternates:pageAlternates('/store',locale,configuredLocalePolicy(config),stringValue(config,'SITE_ORIGIN'))};}
async function Content({query}:{query:Promise<{cursor?:string}>}){
 await connection();const site=await loadSiteContent(),params=await query,catalog=await loadStoreCatalog(site.locale,typeof params.cursor==='string'?params.cursor:undefined);
 return <>{!catalog.items.length&&<meta name='robots' content='noindex, follow'/>}<div className={styles.grid}>{catalog.items.map((p,index)=><ProductCard key={p.id} product={p} eager={index<2}/>)}</div>{!catalog.items.length&&<p className={styles.empty}>{site.locale==='fr'?'Le Store ne propose aucun produit pour le moment.':'There are no products in the Store at the moment.'}</p>}{catalog.nextCursor&&<div className={styles.more}><HeaderLink className='button' href={localizedPath('/store',site.locale,site.policy.defaultLocale)+'?'+new URLSearchParams({cursor:catalog.nextCursor})}>{site.locale==='fr'?'Voir la suite':'View more'}</HeaderLink></div>}<HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
export default function Page({searchParams}:{searchParams:Promise<{cursor?:string}>}){return <Suspense><Content query={searchParams}/></Suspense>;}
