"use client";
import {createContext,useContext,useMemo} from "react";
import {initialMessages,legacyRuntimeMessages,type RuntimeCatalogueContext,type SiteMessages} from "@/lib/i18n/site-messages";
const Context=createContext<{resolved:boolean;messages:SiteMessages;locale:string;defaultLocale:string;scope:"public"|"preview";locales:readonly string[];runtime?:RuntimeCatalogueContext}>({resolved:false,messages:legacyRuntimeMessages(initialMessages("fr"),"fr"),locale:"fr",defaultLocale:"fr",scope:"public",locales:["fr","en"]});
export function SiteContentProvider({messages,locale,defaultLocale,scope="public",locales=[locale],runtime,children}:{messages:SiteMessages;locale:string;defaultLocale:string;scope?:"public"|"preview";locales?:readonly string[];runtime?:RuntimeCatalogueContext;children:React.ReactNode}){const projected=useMemo(()=>!runtime&&['fr','en'].includes(locale)?legacyRuntimeMessages(messages as ReturnType<typeof initialMessages>,locale):messages,[messages,locale,runtime]);return <Context value={{resolved:true,messages:projected,locale,defaultLocale,scope,locales,runtime}}>{children}</Context>;}
export function useSiteContent(){return useContext(Context);}
