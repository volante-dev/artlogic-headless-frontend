"use client";
import MuiButton,{type ButtonProps as MuiButtonProps} from "@mui/material/Button";
export type ButtonProps=Omit<MuiButtonProps,"component"|"href">;
/** Generic frontend layer; client profiles may replace this typed view. */
export function Button({variant="contained",...props}:ButtonProps){return <MuiButton variant={variant} {...props}/>;}
