"use client";
import {useEffect,useRef} from "react";
import {Typography} from "../ui/Typography";
import {Button} from "../ui/Button";
import {useSiteContent} from "../SiteContentProvider";
import type {ContactReceipt as Receipt} from "../../lib/contact/types";
import styles from "./ContactForm.module.css";
export function ContactReceipt({receipt,onNew}:{receipt:Receipt;onNew:()=>void}){
 const {messages:m}=useSiteContent(),ref=useRef<HTMLElement>(null);useEffect(()=>{ref.current?.focus();},[receipt.reference]);
 return <section ref={ref} tabIndex={-1} role="status" data-testid="contact-receipt" className={styles.receipt}><Typography variant="h2">{m["contact.confirmed"]}</Typography><Typography>{m["contact.confirmationHelp"]}</Typography><dl><dt>{m["contact.reference"]}</dt><dd>{receipt.reference}</dd></dl><Typography variant="caption">{m["contact.sentCopy"]}</Typography><div className={styles.actions}><Button variant="outlined" onClick={onNew}>{m["contact.newEnquiry"]}</Button></div></section>;
}
