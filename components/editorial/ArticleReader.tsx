"use client";
import {FormOwnerProvider} from "../../lib/forms/execution";
import{ClassicArticleReader,type ArticleReaderProps}from"./ClassicArticleReader";
import{ImmersiveArticleReader}from"./ImmersiveArticleReader";
import{useEditorialRuntime}from"./immersive/EditorialInteractionProvider";
export type{ArticleReaderProps}from"./ClassicArticleReader";
export function ArticleReader(props:ArticleReaderProps){const{enabled}=useEditorialRuntime();return <FormOwnerProvider owner={{ownerType:"article",ownerId:props.article.id}}>{props.article.readingMode==="immersive"&&enabled?<ImmersiveArticleReader {...props}/>:<ClassicArticleReader {...props}/>}</FormOwnerProvider>;}
