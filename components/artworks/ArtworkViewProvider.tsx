"use client";
import {createContext,useContext,type ReactNode} from "react";
import type {ArtworkViewMode} from "../../lib/artworks/artwork-view";
const Context=createContext<ArtworkViewMode>("generic");
export const useArtworkView=()=>useContext(Context);
export function ArtworkViewProvider({mode,children}:{mode:ArtworkViewMode;children:ReactNode}){return <Context value={mode}>{children}</Context>;}
