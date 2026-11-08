"use client";
import type {SectionProps} from "./types";
import {useSiteContent} from "../components/SiteContentProvider";
import {FormSessionProvider} from "../components/forms/FormSessionProvider";
import type {FormAnimation} from "../components/forms/FormEntrance";
import {FormRenderer} from "../components/forms/FormRenderer";
import {useFormOwner} from "../lib/forms/execution";
import {Alert} from "@mui/material";
export function PublicForm({formId,blockId,animation,hideTitle=false}:{formId:string;blockId:string;animation?:FormAnimation|false;hideTitle?:boolean}){const owner=useFormOwner(),{locale,scope}=useSiteContent();if(!owner&&scope!=="preview")return <Alert severity="error">{locale.startsWith("fr")?"Ce formulaire est indisponible.":"This form is unavailable."}</Alert>;return <FormSessionProvider formId={formId} locale={locale} placement={{ownerType:owner?.ownerType??"page",ownerId:owner?.ownerId??"preview",blockId,...(owner?.artworkId?{artworkId:owner.artworkId}:{})}}><FormRenderer animation={animation} hideTitle={hideTitle}/></FormSessionProvider>;}
export function Form({section}:SectionProps<"form">){return <section id={section.id} style={{maxWidth:1440,marginInline:"auto",padding:"clamp(24px,5vw,80px)",boxSizing:"border-box"}}><PublicForm formId={section.props.formId} blockId={section.id} hideTitle={section.props.hideTitle}/></section>;}
