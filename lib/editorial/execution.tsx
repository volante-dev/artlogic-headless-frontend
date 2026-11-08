"use client";
import {createContext,useContext} from "react";
import type {EditorialPlayerPort} from "./playback";
const Context=createContext<"live"|"inert">("live");
export function EditorialExecutionProvider({mode,children}:{mode:"live"|"inert";children:React.ReactNode}){return <Context value={mode}>{children}</Context>;}
export function useEditorialExecution(){return useContext(Context);}
export function inertEditorialPlayer():EditorialPlayerPort{return {async play(){},async pause(){},async setMuted(){},async destroy(){}};}
