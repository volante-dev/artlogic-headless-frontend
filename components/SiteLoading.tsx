'use client';
import {useState} from 'react';
import {AnimatedAssetImage} from './AnimatedAssetImage';
import {useSiteLoader} from './SiteLoaderProvider';
import {useSiteContent} from './SiteContentProvider';
import styles from './SiteLoading.module.css';
/** Only centered page states use the contributed visual. Inline states keep the line. */
export function LoadingIndicator({compact=false,centered=false,decorative=false,label,className}:{compact?:boolean;centered?:boolean;decorative?:boolean;label?:string;className?:string}){
 const {locale}=useSiteContent(),{asset,scope}=useSiteLoader(),[failed,setFailed]=useState<string|null>(null);
 const custom=centered&&!compact&&asset&&failed!==asset.id;
 return <span className={[styles.indicator,compact?styles.compact:'',custom?styles.custom:'',className??''].filter(Boolean).join(' ')} role={decorative?undefined:'progressbar'} aria-label={decorative?undefined:label??(locale.startsWith('fr')?'Chargement en cours':'Loading')} aria-hidden={decorative||undefined}>{custom?<AnimatedAssetImage key={asset.id} asset={asset} scope={scope} className={styles.customImage} onError={()=>setFailed(asset.id)}/>:<span className={styles.track}/>}</span>;
}
/** Indeterminate feedback shared by route fallbacks and persistent navigation. */
export function SiteLoading({navigation=false,testId='site-loading'}:{navigation?:boolean;testId?:string}){
 const {locale}=useSiteContent();
 return <div className={navigation?styles.navigation:styles.page} data-testid={testId} data-header-status={navigation?'':undefined} role="progressbar" aria-label={locale.startsWith('fr')?'Chargement en cours':'Loading'} aria-busy="true"><LoadingIndicator centered decorative/></div>;
}
