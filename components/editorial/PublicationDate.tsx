'use client';
import {runtimeText} from "@/lib/i18n/site-messages";
import {useSiteContent} from '../SiteContentProvider';
/** Shared publication byline; exhibition calendar periods use ExhibitionPeriod instead. */
export function PublicationDate({date,kind}:{date:string|null|undefined;kind:'publication'|'news'|'exhibition'}){
 const {locale,messages}=useSiteContent();
 if(!date||kind==='exhibition')return null;
 const prefix=runtimeText(messages,locale,"editorial.publishedOn");
 return <time dateTime={date}>{prefix} {new Intl.DateTimeFormat(locale,{dateStyle:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}</time>;
}
