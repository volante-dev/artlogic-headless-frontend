"use client";
import {createContext,useContext,useState,useMemo,type ReactNode} from "react";
import {ImageDescriptorSession,type ImageDescriptors} from "./image-descriptor-session";
import {ImageDescriptorBroker} from "./public-image-descriptor";
import {ResponsiveImageAttempt} from "./responsive-display-state";
import {MediaDisplayAttempt} from "./display-state";
const Context=createContext<{attempts:Map<string,MediaDisplayAttempt>;budgetMs:number;responsive:boolean;descriptors:ImageDescriptors;responsiveAttempts:Map<string,ResponsiveImageAttempt>}|null>(null);
export function MediaDisplayProvider({children,budgetMs=60000,responsive=false,descriptorTimeoutMs=1500}:{children:ReactNode;budgetMs?:number;responsive?:boolean;descriptorTimeoutMs?:number}){
 const [value]=useState(()=>({attempts:new Map<string,MediaDisplayAttempt>(),budgetMs,responsive,descriptors:new ImageDescriptorBroker(descriptorTimeoutMs),responsiveAttempts:new Map<string,ResponsiveImageAttempt>()}));return <Context.Provider value={value}>{children}</Context.Provider>;
}
/** Reset by the reader's article/revision key. Only metadata is shared. */
export function MediaImageSession({children}:{children:ReactNode}){
 const parent=useContext(Context),value=useMemo(()=>parent?{...parent,descriptors:new ImageDescriptorSession(parent.descriptors)}:null,[parent]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMediaDisplayContext(){return useContext(Context);}
