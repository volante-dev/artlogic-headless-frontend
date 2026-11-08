import {HeaderLink as FooterLink} from "../header/HeaderLink";
import type {ResolvedFooter} from "../../lib/presentation/types";
import styles from "../SiteFooter.module.css";
export function FooterService({service}:{service:ResolvedFooter["services"][number]}){return <FooterLink className={styles.service} href={service.destination.href}><span><span className={styles.serviceTitle}>{service.title}</span>{service.description&&<span className={styles.serviceDescription}>{service.description}</span>}</span><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.5"/></svg></FooterLink>;}
