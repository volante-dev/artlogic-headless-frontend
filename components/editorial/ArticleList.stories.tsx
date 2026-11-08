import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ArticleList,type ArticleListProps} from "./ArticleList";
import {useSiteContent} from "../SiteContentProvider";
import {eid} from "../../.storybook/editorial-fixtures";
function ListStory({empty=false,error=false,exhibitions=false}:{empty?:boolean;error?:boolean;exhibitions?:boolean}){
 const {locale}=useSiteContent(),en=locale==="en";
 const props:ArticleListProps={kind:exhibitions?"exhibition":"publication",initialQuery:{page:1,pageSize:24,termIds:[]},initialFilters:{vocabularies:[],terms:[],total:0,page:1,commonRevision:"1",catalogRevision:"1"},initialPage:{items:empty?[]:Array.from({length:3},(_,index)=>({id:eid(4000+index),kind:exhibitions?"exhibition":"publication",canonicalPath:(en?"/en":"")+(exhibitions?"/exhibitions/demo-":"/publications/demo-")+index,title:en?["Matter and gesture","Looking at forms","Objects and their stories"][index]!: ["La matière et le geste","Regarder les formes","Les objets et leurs histoires"][index]!,summary:en?"Synthetic demonstration content for composition and reading.":"Contenu synthétique de démonstration pour la composition et la lecture.",cover:index===2?null:{srcPath:"/media/"+eid(501),alt:en?"Synthetic sculptural form":"Forme sculpturale synthétique"},editorialDate:"2026-10-30",...(exhibitions?{exhibitionPeriod:{startsOn:index===0?"2020-01-20":"2030-01-20",endsOn:index===2?"2030-01-20":index===0?"2020-02-20":"2030-02-20"}}:{}),authors:[{id:eid(4500),name:en?"Demonstration editorial team":"Équipe éditoriale de démonstration",hasProfile:false}]})),total:empty?0:3,page:1,pageSize:24,catalogRevision:"1"},...(error?{initialPage:null,initialError:"service_unavailable"}:{})};
 return <main id="contenu"><ArticleList {...props}/></main>;
}
const meta={title:"Editorial/List",component:ListStory,tags:["autodocs"]} satisfies Meta<typeof ListStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const Immersive:Story={};
export const Empty:Story={args:{empty:true}};
export const Error:Story={args:{error:true}};

export const Exhibitions:Story={args:{exhibitions:true}};
