"use client";
import{useEditorialSurface}from"./immersive/EditorialInteractionProvider";
import {useId,useState} from "react";
import {PublicAssetImage as Image} from "@/components/PublicAssetImage";
import Popover from "@mui/material/Popover";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import type {components} from "../../lib/api/generated";
import {useSiteContent} from "../SiteContentProvider";
import {safeEditorialHref} from "../../lib/editorial/links";
import {Typography} from "../ui/Typography";
import styles from "./AuthorProfile.module.css";
type Author=components["schemas"]["EditorialPublicAuthor"];
export type AuthorProfileProps={author:Author};
export function AuthorProfile({author}:AuthorProfileProps){
 const {messages:m}=useSiteContent(),id=useId(),mobile=useMediaQuery("(max-width:899px)"),[anchor,setAnchor]=useState<HTMLButtonElement|null>(null),open=Boolean(anchor);
 useEditorialSurface(open);
 const enabled=author.hasProfile&&Boolean(author.portraitPath&&author.bio?.trim());
 if(!enabled)return <span className={styles.name}>{author.name}</span>;
 const content=<div className={styles.content}><IconButton className={styles.close} aria-label={m["editorial.close"]} onClick={()=>setAnchor(null)}><svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></IconButton><Image sizes="128px" unoptimized src={author.portraitPath!} alt="" width={128} height={128} className={styles.portrait}/><Typography component="h2" variant="h3" id={id+"-title"}>{author.name}</Typography><Typography component="p" className={styles.bio}>{author.bio}</Typography>{author.link?.startsWith("https:")&&safeEditorialHref(author.link)&&<a href={author.link} target="_blank" rel="noopener noreferrer" className={styles.link}>{m["editorial.authorProfile"]}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>}</div>;
 return <><button type="button" className={styles.trigger} onClick={event=>{event.currentTarget.focus();setAnchor(event.currentTarget);}} aria-expanded={open} aria-controls={open?id:undefined} aria-haspopup="dialog">{author.name}</button>{mobile?<Drawer anchor="bottom" open={open} onClose={()=>setAnchor(null)} slotProps={{paper:{id,role:"dialog","aria-labelledby":id+"-title",className:styles.sheet}}}>{content}</Drawer>:<Popover open={open} anchorEl={anchor} onClose={()=>setAnchor(null)} anchorOrigin={{vertical:"bottom",horizontal:"left"}} transformOrigin={{vertical:"top",horizontal:"left"}} slotProps={{paper:{id,role:"dialog","aria-labelledby":id+"-title",className:styles.popover}}}>{content}</Popover>}</>;
}
