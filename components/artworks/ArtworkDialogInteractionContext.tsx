"use client";
import {createContext,useContext} from "react";
export const ArtworkDialogInteractionContext=createContext<((handler:()=>boolean)=>()=>void)|null>(null);
export const useArtworkDialogInteraction=()=>useContext(ArtworkDialogInteractionContext);
