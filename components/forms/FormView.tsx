"use client";
import {LoadingIndicator} from "../SiteLoading";
import type {ReactNode} from "react";
import {Alert,Box,Button,Stack,Typography} from "@mui/material";
import {FormEntrance,type FormAnimation} from "./FormEntrance";
export interface FormViewProps {
 phase:"inert"|"loading"|"error"|"closed"|"editing"|"submitting"|"uncertain"|"accepted"|"expired";
 locale:string;title?:string;hideTitle?:boolean;intro?:string;successMessage?:string;notice?:string|null;reference?:string;body?:ReactNode;stepNavigation?:ReactNode;animation?:FormAnimation|false;
 onSubmit():void;onRecover():void;onRestart():void;
}
/** Replaceable visual layer: no capability, proof, repository, request or authorization data. */
export function FormView(props:FormViewProps){
 const {phase,locale,notice,animation="form-fade"}=props,fr=locale.startsWith("fr");
 if(phase==="inert")return <Box data-editorial-form aria-disabled="true" sx={{p:4,border:"1px solid",borderColor:"divider"}}><Typography>{fr?"Aperçu du formulaire — aucun envoi":"Form preview — submissions disabled"}</Typography></Box>;
 if(phase==="loading")return <Box data-editorial-form role="status" aria-label={fr?"Chargement":"Loading"} sx={{minHeight:160,display:"grid",placeItems:"center"}}><LoadingIndicator decorative/></Box>;
 if(phase==="closed")return <Typography data-editorial-form>{notice}</Typography>;
 if(phase==="error")return <Alert data-editorial-form severity="error">{notice??(fr?"Ce formulaire est momentanément indisponible. Réessayez plus tard.":"This form is temporarily unavailable. Please try again later.")}</Alert>;
 if(phase==="accepted")return <Stack data-editorial-form role="status" spacing={2}><Typography component="h2" variant="h4">{props.successMessage??(fr?"Votre demande a été reçue.":"Your request has been received.")}</Typography><Typography>{fr?"Référence":"Reference"} : {props.reference}</Typography><Button type="button" onClick={props.onRestart}>{fr?"Nouvelle demande":"New request"}</Button></Stack>;
 return <FormEntrance animation={animation||"form-fade"} enabled={animation!==false}><Box component="form" data-editorial-form aria-label={props.title} noValidate onSubmit={event=>{event.preventDefault();props.onSubmit();}} aria-busy={phase==="submitting"} sx={{width:"100%",minWidth:0}}><Stack spacing={4}>
  {(!props.hideTitle||props.intro)&&<Box data-form-entrance-group>{!props.hideTitle&&<Typography variant="h3" component="h2">{props.title}</Typography>}{props.intro&&<Typography sx={{mt:props.hideTitle?0:2,whiteSpace:"pre-wrap"}}>{props.intro}</Typography>}</Box>}
  {notice&&<Alert severity="error" role="alert">{notice}</Alert>}
  {phase==="expired"&&<Button type="button" onClick={props.onRestart}>{fr?"Nouvelle demande":"New request"}</Button>}
  {(phase==="uncertain"||phase==="submitting")&&<Button type="button" onClick={props.onRecover} disabled={phase==="submitting"}>{fr?"Vérifier l’envoi":"Check submission"}</Button>}
  {props.body}{props.stepNavigation}
 </Stack></Box></FormEntrance>;
}
