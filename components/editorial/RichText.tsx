"use client";
import type {ComponentType,ReactNode} from "react";
import type {components} from "../../lib/editorial/documents.generated";
import {safeEditorialHref} from "../../lib/editorial/links";
import {Typography} from "../ui/Typography";
import {FreshLink} from "../FreshLink";
import styles from "./RichText.module.css";
type RichNode=components["schemas"]["EditorialRichNode"];
export function RichText({document,className,internalLinkComponent:InternalLink=FreshLink}:{document:components["schemas"]["EditorialRichText"];className?:string;internalLinkComponent?:ComponentType<{href:string;children?:ReactNode}>}){
 const render=(node:RichNode,index:number):ReactNode=>{
  if(node.type==="text"){
   let output:ReactNode=node.text;
   for(const mark of node.marks??[]){
    if(mark.type==="bold")output=<strong>{output}</strong>;
    if(mark.type==="italic")output=<em>{output}</em>;
    if(mark.type==="link"&&safeEditorialHref(mark.attrs.href))output=mark.attrs.href.startsWith("/")?<InternalLink href={mark.attrs.href}>{output}</InternalLink>:<a href={mark.attrs.href} {...(mark.attrs.href.startsWith("https:")?{target:"_blank",rel:"noopener noreferrer"}:{})}>{output}</a>;
   }
   return <span key={index}>{output}</span>;
  }
  if(node.type==="hardBreak")return <br key={index}/>;
  const children=(node.content??[]).map(render);
  if(node.type==="paragraph")return <Typography key={index} component="p">{children}</Typography>;
  if(node.type==="heading")return node.attrs.level===2?<Typography key={index} component="h2" variant="h2">{children}</Typography>:<Typography key={index} component="h3" variant="h3">{children}</Typography>;
  if(node.type==="bulletList")return <ul key={index}>{children}</ul>;
  if(node.type==="orderedList")return <ol key={index}>{children}</ol>;
  if(node.type==="listItem")return <li key={index}>{children}</li>;
  if(node.type==="blockquote")return <Typography component="blockquote" variant="h3" key={index}>{children}</Typography>;
  return null;
 };
 return <div data-editorial-rich-text className={[styles.prose,className].filter(Boolean).join(" ")}>{document.content.map(render)}</div>;
}
