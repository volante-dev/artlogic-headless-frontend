"use client";
import {createContext,useContext} from "react";
import {useEditorialExecution} from "../editorial/execution";
import {useContactExecutionMode} from "../contact/execution";
import {useSiteContent} from "@/components/SiteContentProvider";
import type {components} from "./contract-types.generated";
import {formExecutionMode} from "./execution-policy";
export type FormExecutionMode="live"|"inert";
const Context=createContext<FormExecutionMode>("live");
export function FormExecutionProvider({mode,children}:{mode:FormExecutionMode;children:React.ReactNode}){const inherited=useContext(Context);return <Context value={inherited==="inert"?"inert":mode}>{children}</Context>;}
/** Existing page/editorial previews already carry the common inert Contact boundary. */
export function useFormExecutionMode(requested:FormExecutionMode="live"):FormExecutionMode{const inherited=useContext(Context),contact=useContactExecutionMode("live"),site=useSiteContent(),editorial=useEditorialExecution();return formExecutionMode({requested,inherited,contact,scope:site.scope,editorial});}
type Owner=Pick<components["schemas"]["FormsPlacement"],"ownerType"|"ownerId"|"artworkId">;
const OwnerContext=createContext<Owner|null>(null);
export function FormOwnerProvider({owner,children}:{owner:Owner;children:React.ReactNode}){return <OwnerContext value={owner}>{children}</OwnerContext>;}
export function useFormOwner(){return useContext(OwnerContext);}
