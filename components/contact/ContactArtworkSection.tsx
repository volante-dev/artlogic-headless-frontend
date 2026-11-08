"use client";
/* eslint-disable @next/next/no-img-element -- The optimized private media proxy rechecks publication on every read. */
import {ArtworkImage} from "../ArtworkImage";
import {useMediaDisplayContext} from "@/lib/media/MediaDisplayProvider";
import {useMediaDisplay} from "@/lib/media/useMediaDisplay";
import {useSiteContent} from "../SiteContentProvider";
import {useSiteLocale} from "../SiteLocaleBoundary";
import {Typography} from "../ui/Typography";
import {PublicForm} from "../../sections/Form";
import {contactArtworkFromExperience} from "../../lib/contact/artwork";
import type {PublicContactArtwork} from "../../lib/contact/types";
import type {PresentationSection} from "../../lib/presentation/types";
import styles from "./ContactArtworkSection.module.css";
type FormSection=Extract<PresentationSection,{type:"form"|"formImage"}>;
/** Contextual rendering of the existing configured form, preserving its placement. */
export function ContactArtworkSection({section,artwork:initial}:{section:FormSection;artwork:PublicContactArtwork}){
 const {messages:m,defaultLocale}=useSiteContent(),translated=useSiteLocale()?.translation?.artwork;
 const artwork=translated?.artwork.id===initial.id?contactArtworkFromExperience(translated,m["artwork.untitled"],defaultLocale):initial;
 return <section id={section.id} className={styles.section} data-contact-artwork-section>
  <ContactArtworkCard artwork={artwork}/>
  <div className={styles.form} data-contact-configured-form><PublicForm formId={section.props.formId} blockId={section.id} hideTitle={section.props.hideTitle}/></div>
 </section>;
}
export function ContactArtworkCard({artwork}:{artwork:PublicContactArtwork}){
 const {messages:m}=useSiteContent(),photo=artwork.photo,responsive=useMediaDisplayContext()?.responsive;
 const {image:imageRef,src,failed,onLoad,onError}=useMediaDisplay(photo?"/media/"+photo.id:undefined,"artwork",photo?.id);
 const rows:[[string,string|null|undefined],[string,string|null|undefined],[string,string|null|undefined]]=[[m["artwork.year"],artwork.year],[m["artwork.medium"],artwork.medium],[m["artwork.dimensions"],artwork.dimensions]];
 return <aside className={styles.artwork} aria-label={m["contact.artworkHeading"]} data-contact-artwork-card>
  <figure><div className={styles.picture}>{photo&&responsive?<ArtworkImage media={{...photo,path:"/v1/public/media/"+photo.id}} title={artwork.title} style={{objectPosition:artwork.focalPoint?`${artwork.focalPoint.x*100}% ${artwork.focalPoint.y*100}%`:"50% 0%"}} sizes="(max-width:767px) 100vw, 50vw"/>:photo&&!failed?<img ref={imageRef} src={src} onLoad={onLoad} alt={photo.alt??artwork.title} width={photo.width} height={photo.height} style={{objectPosition:artwork.focalPoint?`${artwork.focalPoint.x*100}% ${artwork.focalPoint.y*100}%`:"50% 0%"}} onError={onError}/>:<p className={styles.placeholder}>{m["artwork.imageUnavailable"]}</p>}</div>
   <figcaption className={styles.cartel} data-contact-artwork-cartel>
    <Typography variant="h2" component="h2">{artwork.title}</Typography>
    {artwork.artist&&<p className={styles.artist}>{artwork.artist}</p>}
    {rows.some(([,value])=>Boolean(value?.trim()))&&<dl className={styles.metadata}>{rows.filter(([,value])=>Boolean(value?.trim())).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    <a className={styles.back} href={artwork.url}>{m["contact.backArtwork"]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>
   </figcaption>
  </figure>
 </aside>;
}
