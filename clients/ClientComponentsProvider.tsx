"use client";
import {createContext,useContext,useMemo} from "react";
import {resolveClientComponents} from "./registry";
import type {ClientComponents} from "./registry";
const Context=createContext<ClientComponents|null>(null);
export function ClientComponentsProvider({profileId,children}:{profileId:string;children:React.ReactNode}){const value=useMemo(()=>resolveClientComponents(profileId),[profileId]);return <Context value={value}>{children}</Context>;}
export function useClientComponents(){return useContext(Context)??resolveClientComponents("default");}
