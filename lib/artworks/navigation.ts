import type {MobileArtworkVisualSnapshot} from "./interaction";
export interface ArtworkOrigin {
  href:string;locale:string;scrollX:number;scrollY:number;
  focus:{href:string;index:number}|null;
  artworkScrollTop?:number;
}
interface Visit {token:string;reference:string;locale:string;pushed:boolean;origin:ArtworkOrigin|null;replace:boolean}
export type ArtworkVisitState={kind:"closed"}|{kind:"resolving"|"validating"|"active"|"pending-error"|"route-error";visit:Readonly<Visit>};
export type ArtworkClose={action:"dismiss"}|{action:"back";origin:ArtworkOrigin}|{action:"replace";href:string};
export interface ArtworkActivation {id:number;signal:AbortSignal;reference:string;locale:string}
/** Trust lives only in this document. The browser state can carry a lookup key, never an origin. */
export class ArtworkVisits {
  state:ArtworkVisitState={kind:"closed"};
  private origins=new Map<string,ArtworkOrigin>();
  private visuals=new Map<string,{scrollTop:number;mobile?:MobileArtworkVisualSnapshot}>();
  private serial=0;
  private request:AbortController|null=null;
  get originCount(){return this.origins.size;}
  get visualCount(){return this.visuals.size;}
  get token(){return this.state.kind==="closed"?null:this.state.visit.token;}
  private activate(visit:Visit,kind:"resolving"|"validating"):ArtworkActivation {
    this.request?.abort();this.request=new AbortController();this.serial++;
    this.state={kind,visit};return {id:this.serial,signal:this.request.signal,reference:visit.reference,locale:visit.locale};
  }
  start(reference:string,locale:string,origin:ArtworkOrigin|null):ArtworkActivation {
    return this.activate({token:crypto.randomUUID(),reference,locale,origin:origin?structuredClone(origin):null,pushed:false,replace:false},"resolving");
  }
  /** Called for real route activation, including Forward and Activity reappearance. */
  resume(token:string|null,reference:string,locale:string):ArtworkActivation {
    const trusted=token?this.origins.get(token):undefined;
    return this.activate({token:trusted?token!:crypto.randomUUID(),reference,locale,origin:trusted??null,pushed:true,replace:false},"validating");
  }
  validate():ArtworkActivation {
    if(this.state.kind==="closed")throw new Error("artwork_visit_required");
    return this.activate({...this.state.visit,replace:false},"validating");
  }
  changeLocale(locale:string):ArtworkActivation {
    if(this.state.kind==="closed")throw new Error("artwork_visit_required");
    const visit={...this.state.visit,locale,replace:this.state.visit.pushed};
    return this.activate(visit,visit.pushed?"validating":"resolving");
  }
  changeArtwork(reference:string,locale:string):ArtworkActivation {
    if(this.state.kind==="closed")return this.start(reference,locale,null);
    const visit={...this.state.visit,reference,locale,replace:this.state.visit.pushed};
    return this.activate(visit,visit.pushed?"validating":"resolving");
  }
  retry():ArtworkActivation|null {
    if(this.state.kind!=="pending-error"&&this.state.kind!=="route-error")return null;
    return this.activate({...this.state.visit},this.state.visit.pushed?"validating":"resolving");
  }
  complete(id:number,href:string):{action:"push"|"replace"|"none";href:string;token:string}|null {
    if(id!==this.serial||this.request?.signal.aborted||this.state.kind!=="resolving"&&this.state.kind!=="validating")return null;
    const visit={...this.state.visit},action=visit.replace?"replace":visit.pushed?"none":"push";
    visit.pushed=true;visit.replace=false;visit.reference=href.split("/").at(-1)!;
    if(visit.origin)this.origins.set(visit.token,structuredClone(visit.origin));
    this.state={kind:"active",visit};return {action,href,token:visit.token};
  }
  fail(id:number):boolean {
    if(id!==this.serial||this.request?.signal.aborted||this.state.kind==="closed")return false;
    this.state={kind:this.state.visit.pushed?"route-error":"pending-error",visit:this.state.visit};return true;
  }
  close(fallback:string):ArtworkClose {
    this.request?.abort();this.serial++;
    const state=this.state;this.state={kind:"closed"};
    if(state.kind==="closed"||!state.visit.pushed)return {action:"dismiss"};
    const origin=this.origins.get(state.visit.token);
    return origin?{action:"back",origin:structuredClone(origin)}:{action:"replace",href:fallback};
  }
  rememberVisual(token:string,value:{scrollTop?:number;mobile?:MobileArtworkVisualSnapshot}){
    const prior=this.visuals.get(token);this.visuals.delete(token);this.visuals.set(token,{scrollTop:prior?.scrollTop??0,...prior,...value});
    while(this.visuals.size>32)this.visuals.delete(this.visuals.keys().next().value!);
  }
  visual(token:string){return this.visuals.get(token);}
  dispose(){this.request?.abort();this.serial++;this.state={kind:"closed"};}
}
