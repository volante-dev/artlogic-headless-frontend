import {useRef} from 'react';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {ContactForm} from './ContactForm';
import {ContactFormView} from './ContactFormView';
const configuration={enabled:true,privacyUrl:'https://gallery.example.test/privacy',proofTtlSeconds:86400,limits:{name:120,email:254,subject:160,message:5000}} as const;
function ContactStory({state='default'}:{state?:'default'|'sending'|'validation'|'unavailable'|'rateLimited'|'receipt'|'recovering'|'artwork'|'contextUnavailable'}){
 const ref=useRef<HTMLDivElement>(null);if(state==='default')return <main><ContactForm configuration={configuration} mode="live"/></main>;
 return <main><ContactFormView configuration={configuration} mode="inert" values={{name:'Synthetic visitor',email:'visitor@example.test',subject:'Synthetic subject',message:'Synthetic enquiry text.'}} selected={state==='artwork'?{id:'11111111-1111-4111-8111-111111111111',title:'Synthetic artwork',url:'/artworks/11111111-1111-4111-8111-111111111111'}:null} contextRejected={state==='contextUnavailable'} website="" pending={state==='sending'} restoring={state==='recovering'} receipt={state==='receipt'?{accepted:true,reference:'11111111-1111-4111-8111-111111111111'}:null} notice={state==='validation'?'invalid':state==='unavailable'?'unavailable':state==='rateLimited'?'rateLimited':null} errors={state==='validation'?{email:'Vérifiez cette adresse e-mail.'}:{}} retryAfter={state==='rateLimited'?60:undefined} hasProof={state==='unavailable'} errorRef={ref} onSubmit={event=>event.preventDefault()} onNew={()=>{}} onRecover={()=>{}} onGeneral={()=>{}} onField={()=>{}} onWebsite={()=>{}}/></main>;
}
const meta={title:'Components/ContactForm',component:ContactStory,tags:['autodocs']}satisfies Meta<typeof ContactStory>;export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Sending:Story={args:{state:'sending'}};
export const Validation:Story={args:{state:'validation'}};
export const Unavailable:Story={args:{state:'unavailable'}};
export const RateLimited:Story={args:{state:'rateLimited'}};
export const Receipt:Story={args:{state:'receipt'}};
export const Recovering:Story={args:{state:'recovering'}};
export const Artwork:Story={args:{state:'artwork'}};
export const ContextUnavailable:Story={args:{state:'contextUnavailable'}};
export const English:Story={globals:{locale:'en',width:375}};
export const ClientProfile:Story={globals:{profile:'demo-gallery',theme:'editorial'}};
