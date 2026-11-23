"use client";
import {TeamContacts} from "./TeamContacts";
import type {TeamPerson,TeamSection} from "../lib/presentation/team-types";
import {SectionImage} from "./shared";
import {Typography} from "../components/ui/Typography";
import {useSiteContent} from "../components/SiteContentProvider";
import {teamMessages} from "../lib/presentation/team-messages";
import base from "./Sections.module.css";
import styles from "./OurTeam.module.css";
export function OurTeam({section,headingLevel="h2"}:{section:TeamSection;headingLevel?:"h1"|"h2"}){
 const {locale,defaultLocale}=useSiteContent(),labels=teamMessages(locale,defaultLocale);if(!section.founders.length&&!section.members.length)return null;
 function people(items:TeamPerson[],founders:boolean){return <ul className={`${styles.grid} ${founders?styles.founders:styles.members} ${items.length===1?styles.single:''}`}>{items.map(person=><li key={person.id} data-team-person={person.id}><div className={styles.portrait}><SectionImage image={person.photo} alt={`${person.firstName} ${person.lastName}`} focalPoint={person.focalPoint} sizes={founders?'(min-width: 768px) 50vw, 100vw':'(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 40vw'}/></div><div className={styles.identity}><Typography variant={founders?'h3':'body1'} component="h4" className={founders?styles.founderName:styles.memberName}>{person.firstName} {person.lastName}</Typography><TeamContacts name={`${person.firstName} ${person.lastName}`} email={person.email} phone={person.phone}/></div></li>)}</ul>;}
 return <section id={section.id} className={`${base.section} ${styles.section}`} aria-labelledby={`${section.id}-title`} data-our-team><Typography variant={headingLevel} id={`${section.id}-title`}>{section.title}</Typography>{section.founders.length>0&&<div className={styles.group}><Typography variant="caption" component="h3" className={styles.groupTitle}>{labels.founders}</Typography>{people(section.founders,true)}</div>}{section.members.length>0&&<div className={styles.group}><Typography variant="caption" component="h3" className={styles.groupTitle}>{labels.members}</Typography>{people(section.members,false)}</div>}</section>;
}
