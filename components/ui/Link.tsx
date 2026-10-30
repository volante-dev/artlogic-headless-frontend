"use client";
import MuiLink,{type LinkProps as MuiLinkProps} from "@mui/material/Link";
import {FreshLink} from "../FreshLink";
export type LinkProps=Omit<MuiLinkProps,"component"|"href">&{href:string};
export function Link({href,...props}:LinkProps){return href.startsWith("/")||href.startsWith("#")?<MuiLink component={FreshLink} href={href} {...props}/>:<MuiLink href={href} rel={href.startsWith("https:")?"noopener noreferrer":undefined} {...props}/>;}
