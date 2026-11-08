"use client";
import {presentationImageDescriptor} from "../lib/media/presentation-image-descriptor";
import {useMediaDisplayContext} from "../lib/media/MediaDisplayProvider";
import {detailImageSizes} from "../lib/media/public-image-sizes";
import {PublicAssetImage as Image} from "@/components/PublicAssetImage";
import type {PresentationSection} from "../lib/presentation/types";
import {presentationAssetPath} from "../lib/presentation/types";
import styles from "./HeroMedia.module.css";
import {useHeroPlayback} from "./useHeroPlayback";
import {useSiteContent} from "../components/SiteContentProvider";
import {Typography} from "../components/ui/Typography";
import {Link} from "../components/ui/Link";
import {presentationHref} from "../lib/presentation/links";
export type HeroMediaSection=Extract<PresentationSection,{type:"heroMedia"}>;
export interface HeroMediaProps {section:HeroMediaSection;siteName?:string;demonstration?:boolean;exploreTarget?:string;headingLevel?:"h1"|"h2"}
export function HeroMedia({section,siteName,headingLevel="h1"}:HeroMediaProps){
  const responsive=useMediaDisplayContext()?.responsive;
  const {poster,video,mobileVideo,heading,introduction,link,linkLabel,focalPoint}=section.props;
  const {video:videoRef,playing,toggle}=useHeroPlayback(Boolean(video||mobileVideo),(video?.id??"")+":"+(mobileVideo?.id??"")),{messages,locale,defaultLocale,scope}=useSiteContent();
  const href=presentationHref(link??{kind:"page",pageKey:"artworks"},locale,defaultLocale),posterPath=poster?presentationAssetPath(poster.path,scope):undefined;
  const position=focalPoint?`${focalPoint.x*100}% ${focalPoint.y*100}%`:"50% 50%";
  return <section className={`${styles.hero} ${section.variant==="centered"?styles.centered:""}`} data-testid="hero-media" aria-labelledby={section.id+"-heading"}>
    {/* The synthetic fixture originates at public/demo/projection-poster.png; production media always use the authorized relay. */}
    {posterPath&&<Image descriptor={presentationImageDescriptor(poster)} unoptimized fill priority sizes={poster?.width&&poster.height?detailImageSizes(poster.width/poster.height):"100vw"} src={posterPath} alt="" className={styles.media} style={{objectPosition:position}}/>}
    {(video||mobileVideo)&&<video ref={videoRef} className={styles.media} style={{objectPosition:position}} poster={responsive&&scope==="public"?undefined:posterPath} muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1}>
      {mobileVideo&&<source src={presentationAssetPath(mobileVideo.path,scope)} type={mobileVideo.mimeType} media="(max-width: 767px)"/>}
      <source src={presentationAssetPath((video??mobileVideo)!.path,scope)} type={(video??mobileVideo)!.mimeType}/>
    </video>}
    <div className={styles.invitation}>
      <Typography id={section.id+"-heading"} variant="h1" component={headingLevel} className={styles.title}>{heading||siteName||messages["nav.artworks"]}</Typography>
      {introduction&&<Typography className={styles.introduction}>{introduction}</Typography>}
      <Link href={href} className={styles.discover} sx={{color:"inherit","&:hover":{color:"inherit"}}}>{linkLabel||messages["error.viewArtworks"]}<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M5 5h14v14"/></svg></Link>
    </div>
    <div className={styles.controls}>
      {(video||mobileVideo)&&<button type="button" className={styles.control} aria-label={messages[playing?"video.pause":"video.play"]} onClick={toggle}>
        <span className={styles.playbackIcon}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{playing?<path d="M8 3v18M16 3v18"/>:<path d="m7 3 13 9-13 9Z"/>}</svg></span>
      </button>}
    </div>
  </section>;
}
