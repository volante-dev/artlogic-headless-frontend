import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ArtworkMasonryCatalog} from "./ArtworkMasonryCatalog";
import {ArtworkCatalog} from "./ArtworkCatalog";
import {galleryCatalog} from "../../.storybook/gallery-fixtures";
function Composition({pattern="mixed",columns=3,classic=false,long=false,missing=false}:{pattern?:"none"|"mixed"|"all"|"consecutive";columns?:number;classic?:boolean;long?:boolean;missing?:boolean}){
 const source=galleryCatalog("fr"),page={...source,display:"plp" as const,layout:"masonry" as const,items:source.items.map((a,i)=>({...a,catalogLarge:pattern==="all"||pattern==="mixed"&&i%3===0||pattern==="consecutive"&&i<2,title:long?Array(6).fill(a.title).join(" — "):a.title,media:missing?[]:a.media}))};
 const Catalog=classic?ArtworkCatalog:ArtworkMasonryCatalog;return <Catalog catalog={{kind:"numbered",page}} columns={columns}/>;
}
const meta={title:"Gallery/ArtworkMasonryCatalog",component:Composition,tags:["autodocs"]} satisfies Meta<typeof Composition>;
export default meta;type Story=StoryObj<typeof meta>;
export const Mixed:Story={};
export const AllLarge:Story={args:{pattern:"all"}};
export const Consecutive:Story={args:{pattern:"consecutive"}};
export const Standard:Story={args:{pattern:"none"}};
export const Classic:Story={args:{classic:true}};
export const LongIdentity:Story={args:{long:true}};
export const MissingImages:Story={args:{missing:true}};
export const TwoColumns:Story={args:{columns:2}};
export const FourColumns:Story={args:{columns:4}};
export const Mobile:Story={globals:{viewport:{value:"mobile1",isRotated:false}}};
export const ClientOverride:Story={globals:{profile:"demo-gallery"}};
