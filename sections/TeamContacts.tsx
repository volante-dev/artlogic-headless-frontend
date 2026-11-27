"use client";
import {hasRuntimeModule} from "../lib/i18n/site-messages";
import {useSiteContent} from "../components/SiteContentProvider";
import {teamMessages} from "../lib/presentation/team-messages";
import {teamEmailHref,teamPhoneHref} from "../lib/presentation/team-contacts";
import styles from "./OurTeam.module.css";
export function TeamContacts({name,email,phone}:{name:string;email?:string|null;phone?:string|null}){
 const {locale,messages}=useSiteContent();if(!hasRuntimeModule(messages,locale,'team'))return null;const labels=teamMessages(locale,messages),mail=teamEmailHref(email),call=teamPhoneHref(phone);if(!mail&&!call)return null;
 return <div className={styles.contacts}>{mail&&<a href={mail} aria-label={labels.email(name)}>{email}</a>}{call&&<a href={call} aria-label={labels.phone(name)}>{phone}</a>}</div>;
}
