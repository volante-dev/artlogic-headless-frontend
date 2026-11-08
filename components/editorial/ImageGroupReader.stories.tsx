import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {ArticleReader,type ArticleReaderProps} from './ArticleReader';
import {EditorialInteractionProvider} from './immersive/EditorialInteractionProvider';
import {imageGroupBlock} from '../../.storybook/image-group-fixtures';
import {eid,editorialBlocks} from '../../.storybook/editorial-fixtures';
const article:ArticleReaderProps['article']={id:eid(9800),kind:'publication',canonicalPath:'/publications/group-review',title:'Regards croisés',summary:null,editorialDate:'2026-11-02',cover:null,authors:[],terms:[],alternatePaths:{},blocks:[{...imageGroupBlock('triptych'),immersiveAnimation:'group-reveal'}],relatedArticles:[],publicRevision:'1',commonRevision:'1',readingMode:'immersive'};
const meta={title:'Editorial/Image groups/Reader',component:ArticleReader,args:{article},decorators:[Story=><EditorialInteractionProvider><Story/></EditorialInteractionProvider>]} satisfies Meta<typeof ArticleReader>;
export default meta;type Story=StoryObj<typeof meta>;
export const Immersive:Story={};
const failure:NonNullable<ArticleReaderProps['appearanceFactory']>=()=>{throw Error('Controlled group animation failure');};
export const EngineFailure:Story={args:{appearanceFactory:failure}};
const long=structuredClone(article);if(long.blocks[0]?.type==='imageGroup')long.blocks[0].items[0]!.media.subtext={type:'doc',content:Array.from({length:30},(_,i)=>({type:'paragraph',content:[{type:'text',text:'Paragraphe '+(i+1)+' — lecture complète du sous-texte, sans réduction du visuel.'}]}))};
export const LongCaption:Story={args:{article:long}};

const classic=structuredClone(article);classic.readingMode='classic';classic.blocks=[...editorialBlocks(),imageGroupBlock('diptych'),imageGroupBlock('triptych')];
for(const block of classic.blocks){const medias=block.type==='media'||block.type==='textMedia'?[block.media]:block.type==='carousel'?block.slides.map(s=>s.media):block.type==='imageGroup'?block.items.map(s=>s.media):[];for(const media of medias){media.render.desktop.aspect='natural';media.render.mobile.aspect='natural';if(media.source?.kind==='image'){media.source.srcPath='/demo/gallery/glass-full.png';media.source.width=400;media.source.height=2000;}}}
export const ClassicPortraits:Story={args:{article:classic}};
