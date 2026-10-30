import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SiteHeader} from "./SiteHeader";
import {useSiteContent} from "./SiteContentProvider";
import styles from "./SiteHeader.module.css";
import {Typography} from "./ui/Typography";
function HeaderStory({long=false}:{long?:boolean}){
  const {locale,defaultLocale,messages}=useSiteContent();
  return <><SiteHeader siteName={long?"Galerie de démonstration — collection et recherches autour de la forme":"Galerie démo"} {...{locale,defaultLocale,messages}} section="artworks" languageControl={<nav aria-label={messages["header.languageLabel"]} className={styles.languages}><ul><li><a href="#fr" lang="fr" aria-current={locale==="fr"?"true":undefined}>Français</a></li><li><a href="#en" lang="en" aria-current={locale==="en"?"true":undefined}>English</a></li></ul></nav>}/><main id="contenu"><Typography variant="h1">{locale==="en"?"Demonstration collection":"Collection de démonstration"}</Typography></main></>;
}
const meta={title:"Components/SiteHeader",component:HeaderStory,tags:["autodocs"]} satisfies Meta<typeof HeaderStory>;export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Long:Story={args:{long:true}};
export const English:Story={globals:{locale:"en"}};
