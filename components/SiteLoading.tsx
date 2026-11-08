'use client';
import {useSiteContent} from './SiteContentProvider';
import styles from './SiteLoading.module.css';
/** The same line is used in page, media, form and button loading states. */
export function LoadingIndicator({compact=false,decorative=false,label,className}:{compact?:boolean;decorative?:boolean;label?:string;className?:string}){
 const {locale}=useSiteContent();
 return <span className={[styles.indicator,compact?styles.compact:'',className??''].filter(Boolean).join(' ')} role={decorative?undefined:'progressbar'} aria-label={decorative?undefined:label??(locale.startsWith('fr')?'Chargement en cours':'Loading')} aria-hidden={decorative||undefined}><span className={styles.track}/></span>;
}
/** Indeterminate feedback shared by route fallbacks and persistent navigation. */
export function SiteLoading({navigation=false,testId='site-loading'}:{navigation?:boolean;testId?:string}){
 const {locale}=useSiteContent();
 return <div className={navigation?styles.navigation:styles.page} data-testid={testId} data-header-status={navigation?'':undefined} role="progressbar" aria-label={locale.startsWith('fr')?'Chargement en cours':'Loading'} aria-busy="true"><LoadingIndicator decorative/></div>;
}
