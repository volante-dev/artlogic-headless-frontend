"use client";
import {createContext,useContext} from "react";
import {initialMessages,type SiteMessages} from "@/lib/i18n/messages.generated";
const Context=createContext<{messages:SiteMessages;locale:string;defaultLocale:string;scope:"public"|"preview";locales:readonly string[]}>({messages:initialMessages("fr"),locale:"fr",defaultLocale:"fr",scope:"public",locales:["fr","en"]});
export function SiteContentProvider({messages,locale,defaultLocale,scope="public",locales=[locale],children}:{messages:SiteMessages;locale:string;defaultLocale:string;scope?:"public"|"preview";locales?:readonly string[];children:React.ReactNode}){return <Context value={{messages,locale,defaultLocale,scope,locales}}>{children}</Context>;}
export function useSiteContent(){return useContext(Context);}
