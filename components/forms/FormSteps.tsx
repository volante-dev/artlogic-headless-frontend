"use client";
import {Button,Stack,Typography} from "@mui/material";
import {useFormContext} from "react-hook-form";
import type {FormDocument} from "@/lib/forms/model.generated";
import type {FormRuntimeValues} from "@/lib/forms/resolver";
import {visibleFormFields} from "@/lib/forms/conditions.generated";
export function FormSteps({document,locale,index,onChange,pending}:{document:FormDocument;locale:string;index:number;onChange:(index:number)=>void;pending:boolean}){
 const methods=useFormContext<FormRuntimeValues>(),fr=locale.startsWith("fr"),steps=document.steps;
 async function next(){const visible=new Set(visibleFormFields(document,methods.getValues().answers)),names=document.fields.filter(field=>field.stepId===steps[index]?.id&&visible.has(field.id)).map(field=>`answers.${field.id}` as const);if(await methods.trigger(names,{shouldFocus:true}))onChange(index+1);}
 return <Stack direction="row" sx={{alignItems:"center",justifyContent:"space-between",gap:2,flexWrap:"wrap"}}><Typography variant="body2" aria-live="polite">{steps[index]?.translations[locale]} {steps.length>1&&`· ${index+1}/${steps.length}`}</Typography><Stack direction="row" sx={{gap:1}}>{index>0&&<Button type="button" disabled={pending} onClick={()=>onChange(index-1)}>{fr?"Précédent":"Back"}</Button>}{index<steps.length-1?<Button key="next-step" type="button" variant="contained" disabled={pending} onClick={()=>{void next();}}>{fr?"Continuer":"Continue"}</Button>:<Button key="submit-form" type="submit" variant="contained" disabled={pending}>{document.translations[locale]?.submitLabel??(fr?"Envoyer":"Send")}</Button>}</Stack></Stack>;
}
