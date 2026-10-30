import {useEffect,useRef,useState} from "react";
import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ArtworkOpeningBoundary} from "./ArtworkOpeningBoundary";
import {ArtworkExperience} from "./ArtworkExperience";
import {ArtworkDialogShell} from "./ArtworkDialogShell";
import {ArtworkNavigationContext} from "./ArtworkNavigationContext";
import {SiteContentProvider,useSiteContent} from "../SiteContentProvider";
import {initialMessages} from "../../lib/i18n/messages.generated";
import {galleryContent} from "../../.storybook/gallery-fixtures";
import {Button} from "../ui/Button";
function GalleryStory({locale:initialLocale,state="normal",stage="arrival"}:{locale:string;state?:Parameters<typeof galleryContent>[1];stage?:"arrival"|"transition"|"reading"|"intermediate"|"last"}){
  const container=useRef<HTMLDivElement>(null),[open,setOpen]=useState(true),[locale,setLocale]=useState(initialLocale),content=galleryContent(locale,state);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{const dialog=container.current?.querySelector<HTMLElement>("[role=dialog]");if(dialog)dialog.scrollTop=stage==="transition"?dialog.clientHeight*.5:stage==="reading"?dialog.clientHeight:stage==="intermediate"?dialog.clientHeight*2:stage==="last"?dialog.scrollHeight-dialog.clientHeight:0;});return ()=>cancelAnimationFrame(frame);
  },[stage,open]);
  return <SiteContentProvider locale={locale} defaultLocale="fr" locales={["fr","en"]} messages={initialMessages(locale)}><ArtworkNavigationContext value={{container,close:()=>setOpen(false),changeLocale:setLocale}}><div ref={container} style={{minHeight:"100svh"}}>
    {open?<ArtworkDialogShell artworkRef={content.artwork.slug} locale={locale}><ArtworkExperience content={content}/></ArtworkDialogShell>:<Button onClick={()=>setOpen(true)}>{locale==="en"?"Open demonstration artwork":"Ouvrir l’œuvre de démonstration"}</Button>}
  </div></ArtworkNavigationContext></SiteContentProvider>;
}
function ExperienceStory(props:Omit<React.ComponentProps<typeof GalleryStory>,"locale">){const {locale}=useSiteContent();return <ArtworkOpeningBoundary><GalleryStory locale={locale} {...props}/></ArtworkOpeningBoundary>;}
const meta={title:"Gallery/ArtworkExperience",component:ExperienceStory,tags:["autodocs"]} satisfies Meta<typeof ExperienceStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const Arrival:Story={};
export const Transition:Story={args:{stage:"transition"}};
export const Reading:Story={args:{stage:"reading"}};
export const Intermediate:Story={args:{stage:"intermediate"}};
export const LastView:Story={args:{stage:"last"}};
export const Minimal:Story={args:{state:"empty"}};
export const LongDescription:Story={args:{state:"long",stage:"reading"}};
export const ManyViews:Story={args:{state:"many"}};
export const ImageUnavailable:Story={args:{state:"broken"}};
export const ReducedMotion:Story={parameters:{galleryReducedMotion:true}};
export const ClientTheme:Story={globals:{theme:"editorial",profile:"demo-gallery"}};
