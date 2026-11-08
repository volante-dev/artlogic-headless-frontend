import {useState,useRef,useLayoutEffect} from "react";
import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ArtworkExperience} from "./ArtworkExperience";
import {ArtworkDialogShell} from "./ArtworkDialogShell";
import {ArtworkNavigationContext} from "./ArtworkNavigationContext";
import {ArtworkOpeningBoundary,useArtworkOpening} from "./ArtworkOpeningBoundary";
import {ArtworkInteractionBoundary,useArtworkInteraction} from "./ArtworkInteractionBoundary";
import {SiteContentProvider,useSiteContent} from "../SiteContentProvider";
import {initialMessages} from "../../lib/i18n/messages.generated";
import {mobileGalleryContent,type MobileFixture} from "../../.storybook/gallery-mobile-fixtures";
import {Button} from "../ui/Button";
type Stage="arrival"|"second"|"information"|"zoom";
function StageState({stage}:{stage:Stage}){const store=useArtworkInteraction()!;useLayoutEffect(()=>{const ids=mobileGalleryContent().artwork.media.map(m=>m.id);if(stage!=="arrival"){store.send({type:"select",id:ids[1]!,now:performance.now()},ids);store.send({type:"commit",epoch:store.read().epoch},ids);}if(stage==="information")store.send({type:"information"},ids);if(stage==="zoom")store.send({type:"examine",zoom:2},ids);},[stage,store]);return null;}
function MobileStory({kind="normal",stage="arrival",supplemental=false}:{kind?:MobileFixture;stage?:Stage;supplemental?:boolean}){
 const site=useSiteContent(),[locale,setLocale]=useState(site.locale),[open,setOpen]=useState(true),container=useRef<HTMLDivElement>(null),opening=useArtworkOpening();const content=mobileGalleryContent(locale,kind);
 return <SiteContentProvider locale={locale} defaultLocale="fr" locales={["fr","en"]} messages={initialMessages(locale)}><ArtworkNavigationContext value={{container,close:()=>setOpen(false),changeLocale:setLocale}}><div ref={container} style={{minHeight:"100dvh"}}>
  {open?<ArtworkDialogShell artworkRef={content.artwork.slug} locale={locale}><ArtworkInteractionBoundary artworkId={content.artwork.id} mediaIds={content.artwork.media.map(m=>m.id)}><StageState stage={stage}/><ArtworkExperience content={content} supplementalContent={supplemental?<section id="additional-demonstration"><h2>{locale==="en"?"Additional information":"Informations complémentaires"}</h2><p>{content.description}</p></section>:undefined}/></ArtworkInteractionBoundary></ArtworkDialogShell>:<Button onClick={()=>{opening?.begin();setOpen(true);}}>{locale==="en"?"Open demonstration artwork":"Ouvrir l’œuvre de démonstration"}</Button>}
 </div></ArtworkNavigationContext></SiteContentProvider>;
}
function Story(props:React.ComponentProps<typeof MobileStory>){return <ArtworkOpeningBoundary><MobileStory {...props}/></ArtworkOpeningBoundary>;}
const meta={title:"Gallery/MobileArtworkExperience",component:Story,tags:["autodocs"],globals:{width:390}} satisfies Meta<typeof Story>;
export default meta;type Example=StoryObj<typeof meta>;
export const Arrival:Example={};
export const SecondView:Example={args:{stage:"second"}};
export const Information:Example={args:{stage:"information"}};
export const Zoom:Example={args:{stage:"zoom"}};
export const LongTitle:Example={args:{kind:"long-title"}};
export const NoMedia:Example={args:{kind:"empty"}};
export const OneMedia:Example={args:{kind:"one"}};
export const ManyMedia:Example={args:{kind:"many"}};
export const BrokenMedia:Example={args:{kind:"broken"}};
export const Supplemental:Example={args:{stage:"information",supplemental:true}};
export const ClientTheme:Example={globals:{theme:"editorial",profile:"demo-gallery"}};

/** Review controls live in Storybook only; the public experience has no scrubber or global seam. */
function InformationComparator(){
 const scope=useRef<HTMLDivElement>(null);
 const control=async(action:'open'|'slow'|'normal'|'seek',time=0)=>{
  const {gsap}=await import('gsap');
  if(action==='open')scope.current?.querySelector<HTMLButtonElement>('[data-mobile-trigger="information"]')?.click();
  else if(action==='slow'||action==='normal')gsap.globalTimeline.timeScale(action==='slow'?.3:1);
  else{const timeline=gsap.globalTimeline.getChildren(true,false,true).find(t=>Math.abs(t.duration()-1.88)<.01);timeline?.time(time,false).pause();}
 };
 return <div ref={scope}><div style={{position:'fixed',zIndex:1600,left:0,top:0,display:'flex',gap:8,padding:8,background:'var(--site-color-background)'}}><Button onClick={()=>void control('open')}>Ouvrir / inverser</Button><Button onClick={()=>void control('slow')}>Ralenti</Button><Button onClick={()=>void control('normal')}>Rythme proposé</Button><input aria-label="Temps du mouvement" type="range" min="0" max="1.88" step=".01" onChange={e=>void control('seek',Number(e.currentTarget.value))}/></div><Story kind="normal" supplemental/></div>;
}
export const InformationMotionReview:Example={render:()=> <InformationComparator/>};
export const InformationLongIdentity:Example={args:{kind:'long-title',stage:'information',supplemental:true}};
export const InformationEmpty:Example={args:{kind:'empty',stage:'information'}};
