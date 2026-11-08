"use client";
import {createContext,useContext,type RefObject} from "react";
import type {MobileArtworkVisualSnapshot} from "../../lib/artworks/interaction";
export interface ArtworkNavigation {
  leaveForHeader?:()=>void;
  close:()=>void;changeLocale:(locale:string)=>void;
  container:RefObject<HTMLDivElement|null>;
  rememberVisual?:(scrollTop:number,token?:string|null)=>void;
  readVisual?:(token?:string|null)=>number|undefined;
  rememberMobileVisual?:(snapshot:MobileArtworkVisualSnapshot,token?:string|null)=>void;
  readMobileVisual?:(token?:string|null)=>MobileArtworkVisualSnapshot|undefined;
  visitToken?:()=>string|null;
  activation?:number;
  restoring?:boolean;
  activeLocale?:string;
}
export const ArtworkNavigationContext=createContext<ArtworkNavigation|null>(null);
export function useArtworkNavigation(){return useContext(ArtworkNavigationContext);}
