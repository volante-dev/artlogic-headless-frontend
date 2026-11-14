'use client';
import {useSiteContent} from '../SiteContentProvider';
/** Shared publication byline; exhibition calendar periods use ExhibitionPeriod instead. */
export function PublicationDate({date,kind}:{date:string|null|undefined;kind:'publication'|'news'|'exhibition'}){
 const {locale,defaultLocale}=useSiteContent();
 if(!date||kind==='exhibition')return null;
 const language=new Intl.Locale(locale).language,fallback=new Intl.Locale(defaultLocale).language;
 const prefix=(language==='en'||language!=='fr'&&fallback==='en')?'published on':'publié le';
 return <time dateTime={date}>{prefix} {new Intl.DateTimeFormat(locale,{dateStyle:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}</time>;
}
