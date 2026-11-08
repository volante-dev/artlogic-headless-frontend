"use client";
import {createContext,useContext,useState,type ReactNode} from "react";
import {ImageDescriptorBroker} from "./public-image-descriptor";
import {ResponsiveImageAttempt} from "./responsive-display-state";
import {MediaDisplayAttempt} from "./display-state";
const Context=createContext<{attempts:Map<string,MediaDisplayAttempt>;budgetMs:number;responsive:boolean;descriptors:ImageDescriptorBroker;responsiveAttempts:Map<string,ResponsiveImageAttempt>}|null>(null);
export function MediaDisplayProvider({children,budgetMs=60000,responsive=false,descriptorTimeoutMs=1500}:{children:ReactNode;budgetMs?:number;responsive?:boolean;descriptorTimeoutMs?:number}){
 const [value]=useState(()=>({attempts:new Map<string,MediaDisplayAttempt>(),budgetMs,responsive,descriptors:new ImageDescriptorBroker(descriptorTimeoutMs),responsiveAttempts:new Map<string,ResponsiveImageAttempt>()}));return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMediaDisplayContext(){return useContext(Context);}
