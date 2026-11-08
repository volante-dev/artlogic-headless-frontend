export type ResponsiveDisplayState={status:'idle'|'loading'|'loaded'|'fallback';retry:0|1;startedAt:number|null;generation:number};
/** Candidate changes do not own the attempt, retry counter or deadline. */
export class ResponsiveImageAttempt{
 private pausedAt:number|null=null;
 private readonly loadedClaims=new Set<string>();
 private state:ResponsiveDisplayState={status:'idle',retry:0,startedAt:null,generation:0};private initial=this.state;private listeners=new Set<()=>void>();
 constructor(readonly budgetMs:number,private now=Date.now,readonly identity="image",readonly displayId="image"){}
 snapshot=()=>this.state;serverSnapshot=()=>this.initial;subscribe=(f:()=>void)=>{this.listeners.add(f);return()=>{this.listeners.delete(f);};};
 private update(p:Partial<ResponsiveDisplayState>){this.state={...this.state,...p};this.listeners.forEach(f=>f());}
 start=()=>{if(this.state.status==='idle')this.update({startedAt:this.now(),status:'loading'});};
 pause=()=>{if(this.state.status==='loading'&&this.pausedAt===null)this.pausedAt=this.now();};
 resume=()=>{if(this.pausedAt!==null){const elapsed=this.now()-this.pausedAt;this.pausedAt=null;if(this.state.startedAt!==null)this.update({startedAt:this.state.startedAt+elapsed});}};
 remaining=()=>this.state.startedAt===null?this.budgetMs:Math.max(0,this.budgetMs-(this.pausedAt??this.now())+this.state.startedAt);
 fail=()=>{this.start();if(this.state.status==='fallback')return;if(this.state.retry===1||this.remaining()===0)this.update({status:'fallback'});else this.update({retry:1,status:'loading'});};
 loaded=()=>{if(this.state.status!=='fallback')this.update({status:'loaded'});};
 timeout=()=>{if(this.state.status!=='loaded')this.update({status:'fallback'});};
 claimLoaded=()=>{const key=this.state.generation+':'+this.state.retry;if(this.loadedClaims.has(key))return false;this.loadedClaims.add(key);return true;};
 restart=()=>{this.pausedAt=null;this.loadedClaims.clear();this.update({status:'idle',retry:0,startedAt:null,generation:this.state.generation+1});};
}
