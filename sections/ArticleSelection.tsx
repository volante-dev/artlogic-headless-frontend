"use client";
import {useClientComponents} from "../clients/ClientComponentsProvider";
import type {SectionProps} from "./types";
import {Paragraphs,SectionHeading} from "./shared";
import styles from "./ArticleSelection.module.css";
/** Already authorized cards only. Client overrides never resolve IDs or criteria. */
export function ArticleSelection({section,headingLevel="h2"}:SectionProps<"articleSelection">){
 const {ArticleCard}=useClientComponents(),{heading,introduction,articles}=section.props;
 if(!articles.length)return null;
 return <section id={section.id} className={styles.section}><div className={styles.heading}><SectionHeading text={heading} level={headingLevel}/><Paragraphs text={introduction}/></div><ul className={section.variant==="compact"?styles.compact:styles.grid}>{articles.map(article=><ArticleCard key={article.id} article={article} variant={section.variant==="compact"?"compact":"standard"} headingLevel={headingLevel==="h1"?"h2":"h3"}/>)}</ul></section>;
}
