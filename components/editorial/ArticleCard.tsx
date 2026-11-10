"use client";
import{ExhibitionPeriod}from"./ExhibitionPeriod";
import {useId,useState} from "react";
import {EditorialImage as Image} from "./EditorialImage";
import type {ArticleCardData} from "../../lib/editorial/types";
import {useSiteContent} from "../SiteContentProvider";
import {HeaderLink} from "../header/HeaderLink";
import {Typography} from "../ui/Typography";
import {useEditorialExecution} from "../../lib/editorial/execution";
import styles from "./ArticleList.module.css";
export type ArticleCardProps={article:ArticleCardData;variant?:"lead"|"standard"|"compact";headingLevel?:"h2"|"h3"};
export function ArticleCard({article,variant="standard",headingLevel="h2"}:ArticleCardProps){
 const mode=useEditorialExecution(),{locale,messages}=useSiteContent(),id=useId(),[failed,setFailed]=useState<string|null>(null),cover=article.cover,hasCover=Boolean(cover&&failed!==cover.srcPath),lead=variant==="lead";
 return <li className={`${styles.card} ${styles[variant]} ${hasCover?styles.hasCover:""}`}><article><HeaderLink scroll={false} onAccepted={()=>window.scrollTo({top:0,left:0,behavior:"instant"})} href={article.canonicalPath} aria-labelledby={id} className={styles.cardLink} onClick={event=>{if(mode==="inert")event.preventDefault();}}>
  {cover&&<div className={styles.visual}>{hasCover?<Image key={cover.srcPath} fill priority={lead} sizes={lead?"100vw":"(max-width:899px) 100vw, 50vw"} image={cover.image} src={cover.srcPath} alt={cover.alt} className={styles.image} onError={()=>setFailed(cover.srcPath)}/>:<span className={styles.imageError}>{messages["editorial.imageUnavailable"]}</span>}</div>}
  <div className={styles.cardText}><Typography component={headingLevel} variant={headingLevel} id={id} className={styles.cardTitle}>{article.title}</Typography>{article.exhibitionPeriod&&<ExhibitionPeriod value={article.exhibitionPeriod} locale={locale} className={styles.period}/>} {article.summary&&!lead&&variant!=="compact"&&<Typography component="p" className={styles.cardSummary}>{article.summary}</Typography>}<div className={styles.byline}><time dateTime={article.editorialDate}>{new Intl.DateTimeFormat(locale,{dateStyle:"long",timeZone:"UTC"}).format(new Date(article.editorialDate+"T12:00:00Z"))}</time>{article.authors.length>0&&<span>{article.authors.map(author=>author.name).join(", ")}</span>}</div></div>
 </HeaderLink></article></li>;
}
