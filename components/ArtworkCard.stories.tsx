import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ClientArtworkCard} from "./ClientArtworkCard";
import {useSiteContent} from "./SiteContentProvider";
import {artworkFixture,type FixtureState,fixtureId} from "../.storybook/section-fixtures";
function CardStory({state="normal",broken=false}:{state?:FixtureState;broken?:boolean}){
  const {locale}=useSiteContent(),art=artworkFixture(locale,state);
  if(broken)art.media=art.media.map(media=>({...media,id:fixtureId(404)}));
  return <main id="contenu"><ul style={{listStyle:"none",padding:0,maxWidth:560}}><ClientArtworkCard art={art}/></ul></main>;
}
const meta={title:"Components/ArtworkCard",component:CardStory,tags:["autodocs"]} satisfies Meta<typeof CardStory>;export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ClientOverride:Story={globals:{profile:"demo-gallery",theme:"editorial"}};
export const Long:Story={args:{state:"long"}};
export const Empty:Story={args:{state:"empty"}};
export const ImageError:Story={args:{broken:true}};
