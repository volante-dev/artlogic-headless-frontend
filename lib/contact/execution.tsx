"use client";
import {createContext,useContext} from "react";
import type {ContactExecutionMode} from "./types";
const Context=createContext<ContactExecutionMode|null>(null);
export function ContactExecutionProvider({mode,children}:{mode:ContactExecutionMode;children:React.ReactNode}){const inherited=useContext(Context);return <Context value={inherited==="inert"?"inert":mode}>{children}</Context>;}
export function useContactExecutionMode(requested:ContactExecutionMode){const mode=useContext(Context);return mode==="inert"?"inert":mode??requested;}
