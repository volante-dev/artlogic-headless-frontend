"use client";
import {useLayoutEffect} from "react";
import {useArtworkOpening} from "./ArtworkOpeningBoundary";
import {useSiteContent} from "../SiteContentProvider";
import {Typography} from "../ui/Typography";
import {Button} from "../ui/Button";
import styles from "./ArtworkDialogShell.module.css";
export function ArtworkRouteState({status="loading",retry}:{status?:"loading"|"unavailable"|"error";retry?:()=>void}){
 const {messages}=useSiteContent(),opening=useArtworkOpening();
 useLayoutEffect(()=>{if(status!=="loading")opening?.finish();},[opening,status]);
 if(status==="loading")return <span data-artwork-route-state="loading" className={styles.srOnly} role="status">{messages["catalog.loading"]}</span>;
 return <div data-artwork-route-state={status} className={styles.errorState}>
  <Typography role="status">{messages[status==="unavailable"?"gallery.unavailable":"catalog.errorMessage"]}</Typography>
  {status==="error"&&retry&&<Button onClick={retry}>{messages["catalog.retry"]}</Button>}
 </div>;
}
