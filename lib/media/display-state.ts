export type MediaDisplayState={src:string;retry:0|1;status:"idle"|"loading"|"loaded"|"fallback";startedAt:number|null;displayId:string};
export class MediaDisplayAttempt{
 private pausedAt:number|null=null;
 private state:MediaDisplayState;
 private readonly initial:MediaDisplayState;
 private reportedLoaded=new Set<number>();
 private generation=0;
 private listeners=new Set<()=>void>();
 constructor(private readonly path:string,displayId:string,private readonly budgetMs:number,private readonly now:()=>number=Date.now){this.state={src:path+"?displayId="+encodeURIComponent(displayId),retry:0,status:"idle",startedAt:null,displayId};this.initial=this.state;}
 snapshot=()=>this.state;
 serverSnapshot=()=>this.initial;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return ()=>{this.listeners.delete(listener);};};
 private update(patch:Partial<MediaDisplayState>){this.state={...this.state,...patch};for(const fn of this.listeners)fn();}
 start=()=>{if(this.state.status==="idle")this.update({status:"loading",startedAt:this.now()});};
 pause=()=>{if(this.state.status==="loading"&&this.pausedAt===null)this.pausedAt=this.now();};
 resume=()=>{if(this.pausedAt!==null){const elapsed=this.now()-this.pausedAt;this.pausedAt=null;if(this.state.startedAt!==null)this.update({startedAt:this.state.startedAt+elapsed});}};
 remaining=()=>this.state.startedAt===null?this.budgetMs:Math.max(0,this.budgetMs-((this.pausedAt??this.now())-this.state.startedAt));
 fail=()=>{
  this.start();if(this.state.status==="fallback")return;
  if(this.state.retry===1||this.remaining()===0){this.update({status:"fallback"});return;}
  this.update({retry:1,status:"loading",src:this.path+"?retry=1&displayId="+encodeURIComponent(this.state.displayId)});
 };
 claimLoaded=()=>{const retry=this.state.retry;if(this.reportedLoaded.has(retry))return false;this.reportedLoaded.add(retry);return true;};
 loaded=()=>{if(this.state.status!=="fallback")this.update({status:"loaded"});};
 timeout=()=>{if(this.state.status!=="loaded")this.update({status:"fallback"});};
 restart=()=>{this.pausedAt=null;this.generation++;this.reportedLoaded.clear();const displayId=this.initial.displayId+".manual"+this.generation;this.update({src:this.path+"?displayId="+encodeURIComponent(displayId),displayId,status:"idle",retry:0,startedAt:null});};
}
