"use client";
import{articleKindDescriptors}from"../../lib/editorial/article-kind";
import{ExhibitionPeriod}from"./ExhibitionPeriod";
import {PublicationDate} from "./PublicationDate";
import {useState,useEffect,type ComponentType} from "react";
import {EditorialImage as Image} from "./EditorialImage";
import type {components} from "../../lib/api/generated";
import {useSiteContent} from "../SiteContentProvider";
import {Typography} from "../ui/Typography";
import {AuthorProfile,type AuthorProfileProps} from "./AuthorProfile";
import {EditorialBlocks,type EditorialBlocksProps} from "./EditorialBlocks";
import {ArticleCard,type ArticleCardProps} from "./ArticleCard";
import {FreshLink} from "../FreshLink";
import styles from "./ArticleReader.module.css";
export type ArticleReaderProps={termsInHeading?:boolean;appearanceFactory?:typeof import("./immersive/motion").createEditorialAppearance;imageTimeoutMs?:number;blockRegistry?:typeof import("../../lib/editorial/immersive/registry").editorialBlockRegistry;article:Omit<components["schemas"]["EditorialPreviewArticle"],"diagnostics">;BlocksView?:ComponentType<EditorialBlocksProps>;AuthorView?:ComponentType<AuthorProfileProps>;CardView?:ComponentType<ArticleCardProps>};
/** Shared reader: the server supplies only the currently authorized projection. */
export function ClassicArticleReader({article,blockRegistry,imageTimeoutMs,termsInHeading=false,BlocksView=EditorialBlocks,AuthorView=AuthorProfile,CardView=ArticleCard}:ArticleReaderProps){
 const {locale,defaultLocale,messages}=useSiteContent(),[failed,setFailed]=useState<string|null>(null),[coverLoaded,setCoverLoaded]=useState<string|null>(null),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const path=article.cover?.srcPath;if(!path||!imageTimeoutMs||coverLoaded===path||failed===path)return;const timer=setTimeout(()=>setFailed(path),imageTimeoutMs);return()=>clearTimeout(timer);},[article.cover,imageTimeoutMs,coverLoaded,failed,attempt]);
 const terms=article.terms.length>0&&<nav className={styles.terms} aria-label={messages["editorial.filters"]}>{article.terms.map(term=><FreshLink key={term.id} href={(locale===defaultLocale?"":"/"+locale)+"/"+articleKindDescriptors[article.kind].section+"?termIds="+term.id}>{term.label}</FreshLink>)}</nav>;
 return <article data-editorial-document className={styles.article}>
  <header className={`${styles.hero} ${article.cover?styles.withCover:styles.withoutCover}`}>
   {article.cover&&failed!==article.cover.srcPath&&<Image key={article.cover.srcPath+":"+attempt} fill priority sizes="100vw" image={article.cover.image} src={article.cover.srcPath} alt={article.cover.alt} className={styles.cover} onLoad={()=>setCoverLoaded(article.cover!.srcPath)} onError={()=>setFailed(article.cover!.srcPath)}/>}
   <div className={styles.heading}>
    {article.title&&<Typography component="h1" variant="h1" className={styles.title}>{article.title}</Typography>}
    {article.exhibitionPeriod&&<ExhibitionPeriod value={article.exhibitionPeriod} locale={locale} className={styles.period}/>}
    {article.summary&&<Typography component="p" className={styles.summary}>{article.summary}</Typography>}
    {((article.kind!=="exhibition"&&article.editorialDate)||article.authors.length>0)&&<div className={styles.byline}><PublicationDate date={article.editorialDate} kind={article.kind}/>{article.authors.length>0&&<ul aria-label={messages["editorial.authors"]}>{article.authors.map(author=><li key={author.id}><AuthorView author={author}/></li>)}</ul>}</div>}
    {termsInHeading&&terms}
    {article.cover&&failed===article.cover.srcPath&&<p role="alert" className={styles.error}>{messages["editorial.imageUnavailable"]}{imageTimeoutMs&&<button type="button" onClick={()=>{setFailed(null);setCoverLoaded(null);setAttempt(a=>a+1);}}>{messages["editorial.retry"]}</button>}</p>}
   </div>
  </header>
  {!termsInHeading&&terms}
  <BlocksView blocks={article.blocks} registry={blockRegistry}/>
  {article.relatedArticles.length>0&&<section className={styles.related}><Typography component="h2" variant="h2">{messages["editorial.related"]}</Typography><ul>{article.relatedArticles.map(article=><CardView key={article.id} article={article} variant="compact" headingLevel="h3"/>)}</ul></section>}
 </article>;
}
