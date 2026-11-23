"use client";
import {useSiteContent} from "../components/SiteContentProvider";
import {teamMessages} from "../lib/presentation/team-messages";
import {teamEmailHref,teamPhoneHref} from "../lib/presentation/team-contacts";
import styles from "./OurTeam.module.css";
export function TeamContacts({name,email,phone}:{name:string;email?:string|null;phone?:string|null}){
 const {locale,defaultLocale}=useSiteContent(),labels=teamMessages(locale,defaultLocale),mail=teamEmailHref(email),call=teamPhoneHref(phone);if(!mail&&!call)return null;
 return <div className={styles.contacts}>{mail&&<a href={mail} aria-label={labels.email(name)}>{email}</a>}{call&&<a href={call} aria-label={labels.phone(name)}>{phone}</a>}</div>;
}
