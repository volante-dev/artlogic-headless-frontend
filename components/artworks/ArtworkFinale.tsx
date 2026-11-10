"use client";
import {type ReactNode,type RefObject} from "react";
import {ArtworkFinaleDetails} from "./ArtworkFinaleDetails";
import styles from "./ArtworkFinale.module.css";
export interface ArtworkFinaleProps {
 title:string;metadata?:ReactNode;previousDetails?:ReactNode;children?:ReactNode;provenance?:ReactNode;provenanceLabel:string;
 contact?:ReactNode;active:boolean;headingComponent?:"h1"|"p";readingRef?:RefObject<HTMLDivElement|null>;
}
/** Identity and contact are persistent DOM nodes shared with the preceding information state. */
export function ArtworkFinale({title,metadata,previousDetails,children,provenance,provenanceLabel,contact,active,readingRef,headingComponent:Heading="h1"}:ArtworkFinaleProps){
 return <><div className={styles.mobileVeil} data-finale-mobile-veil aria-hidden="true"/><section className={styles.reading} data-finale-reading aria-label={title}>
  <div data-finale-identity><Heading data-finale-title>{title}</Heading>{metadata&&<div className={styles.metadata}>{metadata}</div>}
   {previousDetails&&<div className={styles.existing} data-finale-existing-details>{previousDetails}</div>}
  </div>
  <ArtworkFinaleDetails active={active} readingRef={readingRef} provenance={provenance} provenanceLabel={provenanceLabel}>{children}</ArtworkFinaleDetails>
  {contact&&<div className={styles.contact} data-finale-contact>{contact}</div>}
 </section></>;
}
