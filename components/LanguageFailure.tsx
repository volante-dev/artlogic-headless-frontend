'use client';
import {createContext,useContext,type ReactNode} from 'react';
import Link from 'next/link';
import {Typography} from './ui/Typography';
import styles from './LanguageFailure.module.css';
const Context=createContext<{locale:string;defaultLocale:string}|null>(null);
/** Routing identity is known before content, without loading a translation or consulting a secondary environment locale. */
export function LanguageFailureProvider({locale,defaultLocale,children}:{locale:string;defaultLocale:string;children?:ReactNode}){return <Context value={{locale,defaultLocale}}>{children}</Context>;}
/** A cold failed read has no admitted copy. Use a neutral status and a native language name, never French text under another locale. */
export function LanguageFailure(){
 const context=useContext(Context),locale=context?.locale,main=context?.defaultLocale;
 let label=main??'/';if(locale&&main)try{label=new Intl.DisplayNames([locale],{type:'language'}).of(main)??main;}catch{label=main;}
 return <section role="alert" lang={locale} data-runtime-language-failure className={styles.frame}><Typography variant="h1">503</Typography><Link href="/" prefetch={false} hrefLang={main}>{label}</Link></section>;
}
