import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {useState} from "react";
import {ImmersiveBlockView} from "./immersive/BlockViews";
import {EditorialBlocks} from "./EditorialBlocks";
import {MediaBlock} from "./MediaBlock";
import {EditorialExecutionProvider} from "../../lib/editorial/execution";
import {editorialBlocks,editorialCarousel,editorialImage,editorialVideo,eid} from "../../.storybook/editorial-fixtures";
const meta={title:"Editorial/Blocks",component:EditorialBlocks,tags:["autodocs"],args:{blocks:editorialBlocks()}} satisfies Meta<typeof EditorialBlocks>;
export default meta;type Story=StoryObj<typeof meta>;
export const Composition:Story={};
export const Successive:Story={args:{blocks:editorialBlocks().filter(b=>b.type==="textMedia").map(b=>b.type==="textMedia"?{...b,layout:"successive"}:b)}};
export const Carousel:Story={args:{blocks:[editorialCarousel()]}};
export const Automatic:Story={args:{blocks:[editorialCarousel({automatic:true})]}};
export const SingleSlide:Story={args:{blocks:[editorialCarousel({one:true})]}};
export const NoSlides:Story={args:{blocks:[editorialCarousel({empty:true})]}};
export const Mixed:Story={args:{blocks:[editorialCarousel({video:true})]}};
export const RetiredMedia:Story={args:{blocks:[{id:eid(2500),type:"media",variant:"default",media:{...editorialImage(),source:null,cta:null,artworkInfo:[],video:null}}]}};
export const PlayersInert:Story={args:{blocks:["video","youtube","vimeo"].map((kind,i)=>({id:eid(2700+i),type:"media",variant:"default",media:editorialVideo(kind as "video"|"youtube"|"vimeo")}))}};
// Opt-in local/controlled-provider playback fixtures; the catalog sweep stays offline and inert.
function PlayerRecipe({kind,live=false}:{kind:"video"|"youtube"|"vimeo";live?:boolean}){
 const [active,setActive]=useState(true),[second,setSecond]=useState(false);
 const media=editorialVideo(kind);if(second&&media.source?.kind==="youtube")media.source={...media.source,videoId:"DEMOvideo02"};
 return <EditorialExecutionProvider mode={live?"live":"inert"}><div style={{maxWidth:900,marginInline:"auto"}}><button type="button" onClick={()=>setActive(value=>!value)}>Basculer la slide active</button><button type="button" onClick={()=>setSecond(value=>!value)}>Changer la source</button><MediaBlock media={media} active={active}/><div style={{height:"120vh"}}/></div></EditorialExecutionProvider>;
}
export const NativePlayback:Story={render:(_,context)=><PlayerRecipe kind="video" live={context.globals.playback==="live"}/>};
export const YoutubePlayback:Story={render:(_,context)=><PlayerRecipe kind="youtube" live={context.globals.playback==="live"}/>};
export const VimeoPlayback:Story={render:(_,context)=><PlayerRecipe kind="vimeo" live={context.globals.playback==="live"}/>};

export const ImmersiveInactive:Story={render:()=> <EditorialExecutionProvider mode="inert"><div inert style={{minHeight:"100svh",padding:32}}><ImmersiveBlockView block={editorialCarousel({video:true})} context={{viewId:"story:inactive",active:false,phase:"inactive",direction:0,reducedMotion:true,executionMode:"inert",suspended:false,registerScrollHost:()=>{},registerMotionTarget:()=>{},acquireSuspension:()=>()=>{}}}/></div></EditorialExecutionProvider>};
