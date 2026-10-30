import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SiteHeader} from "./SiteHeader";
import {useSiteContent} from "./SiteContentProvider";
import styles from "./SiteHeader.module.css";
import {Typography} from "./ui/Typography";
function HeaderStory({long=false,immersive=false}:{long?:boolean;immersive?:boolean}){
  const {locale,defaultLocale,messages}=useSiteContent();
  return <><SiteHeader siteName={long?"Galerie de démonstration — collection et recherches autour de la forme":"Galerie démo"} {...{locale,defaultLocale,messages,immersive}} section="artworks" languageControl={<nav aria-label={messages["header.languageLabel"]} className={styles.languages}><ul><li><a href="#fr" lang="fr" aria-current={locale==="fr"?"true":undefined}>Français</a></li><li><a href="#en" lang="en" aria-current={locale==="en"?"true":undefined}>English</a></li></ul></nav>}/><main id="contenu" tabIndex={-1} style={immersive?{minHeight:"140svh",paddingTop:180,color:"var(--site-color-inverseText)",background:"linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('/demo/projection-poster.png') center/cover"}:{minHeight:"140svh"}}><Typography variant="h1">{locale==="en"?"Demonstration collection":"Collection de démonstration"}</Typography><a href="#content-link">{locale==="en"?"Explore the collection":"Découvrir la collection"}</a></main></>;
}
const meta={title:"Components/SiteHeader",component:HeaderStory,tags:["autodocs"]} satisfies Meta<typeof HeaderStory>;export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Long:Story={args:{long:true}};
export const English:Story={globals:{locale:"en"}};
export const Immersive:Story={args:{immersive:true},globals:{width:390}};
