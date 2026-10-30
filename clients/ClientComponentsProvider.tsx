"use client";
import {createContext,useContext,useMemo} from "react";
import {resolveClientComponents} from "./registry";
const Context=createContext(resolveClientComponents("default"));
export function ClientComponentsProvider({profileId,children}:{profileId:string;children:React.ReactNode}){const value=useMemo(()=>resolveClientComponents(profileId),[profileId]);return <Context value={value}>{children}</Context>;}
export function useClientComponents(){return useContext(Context);}
