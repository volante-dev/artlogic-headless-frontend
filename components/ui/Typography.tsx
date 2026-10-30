"use client";
import MuiTypography,{type TypographyProps as MuiTypographyProps} from "@mui/material/Typography";
export type TypographyProps=Omit<MuiTypographyProps,"variant">&{variant?:"h1"|"h2"|"h3"|"body1"|"body2"|"caption"|"button"};
export function Typography(props:TypographyProps){return <MuiTypography {...props}/>;}
