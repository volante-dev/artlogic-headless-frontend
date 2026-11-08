"use client";
import MuiButton,{type ButtonProps as MuiButtonProps} from "@mui/material/Button";
import {LoadingIndicator} from '../SiteLoading';
export type ButtonProps=Omit<MuiButtonProps,"component"|"href">&{surface?:"light"};
/** Generic frontend layer; client profiles may replace this typed view. */
export function Button({variant="contained",surface,loadingIndicator=<LoadingIndicator compact/>,...props}:ButtonProps){return <MuiButton variant={variant} loadingIndicator={loadingIndicator} {...(surface?{color:"inherit" as const,"data-control-surface":surface}:{})} {...props}/>;}
