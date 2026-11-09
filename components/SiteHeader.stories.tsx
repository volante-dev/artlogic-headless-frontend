import {useState} from "react";
import {sections,localizedPath} from "../lib/i18n/routes";
import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SiteLogo} from "./SiteLogo";
import {SiteHeader} from "./SiteHeader";
import {useSiteContent} from "./SiteContentProvider";
import styles from "./SiteHeader.module.css";
import {Typography} from "./ui/Typography";
export function HeaderStory({long=false,immersive=false,asymmetricLogos=false}:{long?:boolean;immersive?:boolean;asymmetricLogos?:boolean}){
  const {locale,defaultLocale,messages}=useSiteContent();
  return <><SiteHeader navigation={{schemaVersion:1,scope:"public",revision:"1",releaseId:"11111111-1111-4111-8111-111111111111",locale,items:sections.map(pageKey=>({pageKey,href:localizedPath("/"+pageKey,locale,defaultLocale)}))}} logo={asymmetricLogos?<SiteLogo siteName="Galerie démo" logo={{id:"10000000-0000-4000-8000-000000000001",width:892,height:60,byteSize:1024,mimeType:"image/webp"}}/>:undefined} whiteLogo={asymmetricLogos?<SiteLogo siteName="Galerie démo" logo={{id:"10000000-0000-4000-8000-000000000002",width:1024,height:342,byteSize:1024,mimeType:"image/webp"}}/>:undefined} siteName={long?"Galerie de démonstration — collection et recherches autour de la forme":"Galerie démo"} {...{locale,defaultLocale,messages,immersive}} section="artworks" languageControl={<nav aria-label={messages["header.languageLabel"]} className={styles.languages}><ul><li><a href="#fr" lang="fr" aria-current={locale==="fr"?"true":undefined}>Français</a></li><li><a href="#en" lang="en" aria-current={locale==="en"?"true":undefined}>English</a></li></ul></nav>}/><main id="contenu" tabIndex={-1} style={immersive?{minHeight:"140svh",paddingTop:180,color:"var(--site-color-inverseText)",background:"linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('/demo/projection-poster.png') center/cover"}:{minHeight:"140svh"}}><Typography variant="h1">{locale==="en"?"Demonstration collection":"Collection de démonstration"}</Typography><a href="#content-link">{locale==="en"?"Explore the collection":"Découvrir la collection"}</a></main></>;
}
const meta={title:"Components/SiteHeader",component:HeaderStory,tags:["autodocs"]} satisfies Meta<typeof HeaderStory>;export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Long:Story={args:{long:true}};
export const English:Story={globals:{locale:"en"}};
export const Immersive:Story={args:{immersive:true},globals:{width:390}};

export const AsymmetricLogos:Story={args:{immersive:true,asymmetricLogos:true},globals:{width:390}};
export const AsymmetricLogosDefault:Story={args:{asymmetricLogos:true},globals:{width:1440}};

function HeaderTransitionStory(){
 const [immersive,setImmersive]=useState(true);return <><button type="button" onClick={()=>setImmersive(value=>!value)} style={{position:'fixed',bottom:16,right:16,zIndex:2000}}>Changer de page</button><HeaderStory immersive={immersive} asymmetricLogos/></>;
}
export const RouteTransition:Story={render:()=> <HeaderTransitionStory/>,globals:{width:1440}};
