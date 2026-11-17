"use client";
import {createContext,useContext} from "react";
import type {PresentationAsset} from "../lib/presentation/types";
const Context=createContext<{asset:PresentationAsset|null;scope:"public"|"preview"}>({asset:null,scope:"public"});
export function SiteLoaderProvider({asset,scope,children}:{asset?:PresentationAsset|null;scope:"public"|"preview";children?:React.ReactNode}){return <Context value={{asset:asset??null,scope}}>{children}</Context>;}
export function useSiteLoader(){return useContext(Context);}
