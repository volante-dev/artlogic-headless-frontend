"use client";
import type {SectionProps} from "./types";
import {SectionImage} from "./shared";
import {PublicForm} from "./Form";
import styles from "./FormImage.module.css";
export function FormImage({section}:SectionProps<"formImage">){return <section id={section.id} className={`${styles.section} ${section.props.imageSide==="right"?styles.right:""}`}><div className={styles.image}><SectionImage image={section.props.image} alt={section.props.alt} focalPoint={section.props.focalPoint}/></div><div className={styles.content}><PublicForm formId={section.props.formId} blockId={section.id} hideTitle={section.props.hideTitle}/></div></section>;}
