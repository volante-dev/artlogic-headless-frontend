"use client";
import MuiIconButton,{type IconButtonProps as MuiIconButtonProps} from "@mui/material/IconButton";
import {LoadingIndicator} from '../SiteLoading';
export type IconButtonProps=Omit<MuiIconButtonProps,"component"|"href">&{surface?:"light"};
/** Generic MUI control; light surfaces inherit the shared themed elevation. */
export function IconButton({surface,loadingIndicator=<LoadingIndicator compact/>,...props}:IconButtonProps){return <MuiIconButton data-control-surface={surface} loadingIndicator={loadingIndicator} {...props}/>;}
