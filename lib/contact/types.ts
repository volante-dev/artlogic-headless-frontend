import type {components} from "../api/generated";
export type ContactConfiguration=components["schemas"]["ContactConfig"];
export type ContactReceipt=components["schemas"]["ContactReceipt"];
export type ContactSubmission=components["schemas"]["ContactSubmission"];
export type ContactExecutionMode="live"|"captured"|"inert";
export interface PublicContactArtwork{
 id:string;title:string;url:string;artist?:string|null;year?:string|null;medium?:string|null;dimensions?:string|null;
 photo?:{id:string;alt:string|null;width:number;height:number}|null;focalPoint?:{x:number;y:number}|null;
}
export interface ContactFormProps{configuration:ContactConfiguration|null;artwork?:PublicContactArtwork|null;contextUnavailable?:boolean;mode:ContactExecutionMode;headingLevel?:"h1"|"h2"}

export interface ContactValues{name:string;email:string;subject:string;message:string}
export interface ContactFormViewProps extends ContactFormProps{
 values:ContactValues;selected:PublicContactArtwork|null;contextRejected:boolean;website:string;pending:boolean;restoring:boolean;receipt:ContactReceipt|null;notice:string|null;errors:Record<string,string>;retryAfter?:number;hasProof:boolean;
 errorRef:import("react").RefObject<HTMLDivElement|null>;
 onSubmit:(event:import("react").FormEvent)=>void;onNew:()=>void;onRecover:()=>void;onGeneral:()=>void;onField:(field:keyof ContactValues,value:string)=>void;onWebsite:(value:string)=>void;
}
