import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {EditorialExecutionProvider} from "../../lib/editorial/execution";
import {EditorialInteractionProvider} from "./immersive/EditorialInteractionProvider";
import {ArticleReader,type ArticleReaderProps} from "./ArticleReader";
import {editorialBlocks,eid} from "../../.storybook/editorial-fixtures";
const article:ArticleReaderProps["article"]={id:eid(3000),kind:"publication",canonicalPath:"/publications/etude-demonstration",title:"La matière et le geste",summary:"Un regard sur les formes, les surfaces et la lumière. Contenu synthétique de démonstration.",editorialDate:"2026-10-30",cover:{srcPath:"/media/"+eid(501),alt:"Composition de démonstration — verre et lumière"},authors:[{id:eid(3100),name:"Équipe éditoriale de démonstration",hasProfile:false,portraitPath:null,bio:null,link:null}],terms:[],alternatePaths:{},blocks:editorialBlocks(),relatedArticles:[],publicRevision:"1",commonRevision:"1"};
const meta={title:"Editorial/Article",component:ArticleReader,tags:["autodocs"],args:{article}} satisfies Meta<typeof ArticleReader>;
export default meta;type Story=StoryObj<typeof meta>;
export const Immersive:Story={};
export const WithoutCover:Story={args:{article:{...article,cover:null}}};
export const UnfinishedPreview:Story={args:{article:{...article,title:"",summary:null,editorialDate:null,authors:[],cover:null,blocks:[]}}};
export const LongTitle:Story={args:{article:{...article,title:"Objets, regards et transmissions : explorer les liens entre les matières, les gestes et les histoires",authors:[],summary:null}}};

export const ExhibitionPast:Story={args:{article:{...article,kind:"exhibition",canonicalPath:"/exhibitions/demonstration",exhibitionPeriod:{startsOn:"2020-01-20",endsOn:"2020-02-20"}}}};
export const ExhibitionFuture:Story={args:{article:{...article,kind:"exhibition",canonicalPath:"/exhibitions/demonstration",exhibitionPeriod:{startsOn:"2030-01-20",endsOn:"2030-02-20"}}}};
export const ExhibitionOneDay:Story={args:{article:{...article,kind:"exhibition",canonicalPath:"/exhibitions/demonstration",exhibitionPeriod:{startsOn:"2030-01-20",endsOn:"2030-01-20"}}}};

/** External players remain inert in documentation. Navigation and local images stay testable. */
export const ControlledImmersive:Story={decorators:[Story=><EditorialInteractionProvider><EditorialExecutionProvider mode="inert"><Story/></EditorialExecutionProvider></EditorialInteractionProvider>],args:{article:{...article,readingMode:"immersive"}}};
export const ImmersiveOverflow:Story={...ControlledImmersive,args:{article:{...article,readingMode:"immersive",cover:null,blocks:[{id:eid(9001),type:"text",variant:"default",text:{type:"doc",content:Array.from({length:45},(_,i)=>({type:"paragraph" as const,content:[{type:"text" as const,text:`Paragraphe ${i+1}. Le texte reste intégralement lisible dans cette vue, sans réduction de la taille de caractères.`}]}))}}]}}};
export const ImmersiveFallback:Story={decorators:[Story=><EditorialInteractionProvider enabled={false}><EditorialExecutionProvider mode="inert"><Story/></EditorialExecutionProvider></EditorialInteractionProvider>],args:{article:{...article,readingMode:"immersive"}}};
export const ImmersiveMaximum:Story={...ControlledImmersive,args:{article:{...article,readingMode:'immersive',blocks:Array.from({length:100},(_,index)=>{const block=editorialBlocks().find(item=>item.type==='textMedia')!;return {...block,id:eid(10000+index),layout:'successive' as const};}),relatedArticles:[{id:eid(50000),kind:'publication',canonicalPath:'/publications/related',title:'Un autre regard',summary:null,editorialDate:'2026-11-01',cover:null,authors:[]}]}}};

const unavailableAppearance:NonNullable<ArticleReaderProps['appearanceFactory']>=()=>{throw new Error('Animation engine unavailable in this controlled fixture');};
export const ImmersiveEngineFailure:Story={...ControlledImmersive,args:{article:{...article,readingMode:'immersive'},appearanceFactory:unavailableAppearance}};
