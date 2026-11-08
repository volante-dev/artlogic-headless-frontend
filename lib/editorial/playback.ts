export interface EditorialPlayerPort{play():Promise<void>;pause():Promise<void>;setMuted(value:boolean):Promise<void>;destroy():Promise<void>}
type Lease={owner:object;manual:boolean;pause():Promise<void>;valid():boolean};
export class PlaybackArbiter{
 private active:Lease|null=null;
 private pending:Promise<unknown>=Promise.resolve();
 claim(lease:Lease):Promise<boolean>{
  const work=this.pending.then(async()=>{
   if(!lease.valid())return false;
   if(this.active?.owner===lease.owner){this.active=lease;return true;}
   if(this.active?.manual&&!lease.manual)return false;
   const previous=this.active;this.active=null;
   if(previous)try{await previous.pause();}catch{/* A failed/removed provider cannot retain the lease. */}
   if(!lease.valid())return false;this.active=lease;return true;
  });
  this.pending=work.then(()=>undefined,()=>undefined);return work;
 }
 release(owner:object){if(this.active?.owner===owner)this.active=null;}
}
export type PlaybackSnapshot={status:"paused"|"starting"|"playing"|"blocked"|"error";muted:boolean};
/** Provider-neutral state machine. Only explicit user actions call toggleSound. */
export class EditorialPlayback{
 private value:PlaybackSnapshot={status:"paused",muted:true};private listeners=new Set<()=>void>();private epoch=0;private disposed=false;private visible=false;private autoplayEligible=false;private automaticPlayback=false;private pageVisible=true;private active=true;private wantsPlayback=false;
 constructor(private readonly player:EditorialPlayerPort,private readonly arbiter:PlaybackArbiter){}
 get snapshot(){return this.value;}
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private update(value:Partial<PlaybackSnapshot>){if(this.disposed)return;this.value={...this.value,...value};for(const listener of this.listeners)listener();}
 setVisibility(visible:boolean,autoplayEligible=visible){this.visible=visible;this.autoplayEligible=autoplayEligible;if(!visible||this.automaticPlayback&&!autoplayEligible)void this.pause();}
 setPageVisibility(visible:boolean){this.pageVisible=visible;if(!visible)void this.pause();}
 setActive(active:boolean){this.active=active;if(!active)void this.pause();}
 async play(automatic=false){
  if(this.disposed||!this.active||!this.pageVisible||automatic&&!this.autoplayEligible)return;
  if(this.value.status==="starting"||this.value.status==="playing")return;
  const epoch=++this.epoch,valid=()=>!this.disposed&&this.epoch===epoch&&this.active&&this.pageVisible&&(!automatic||this.autoplayEligible);
  if(!await this.arbiter.claim({owner:this,manual:!automatic,pause:async()=>{await this.pause();if(this.value.status==="error")await this.dispose();},valid}))return;
  if(!valid()){this.arbiter.release(this);return;}
  this.wantsPlayback=true;this.automaticPlayback=automatic;this.update({status:"starting",...(automatic?{muted:true}:{})});
  try{
   await this.player.setMuted(automatic||this.value.muted);if(!valid())return;
   await this.player.play();
   if(!valid()){if(this.disposed||!this.wantsPlayback||!this.active||!this.pageVisible)await this.player.pause();return;}
   this.update({status:"playing"});
  }catch{if(valid()){this.wantsPlayback=false;this.arbiter.release(this);this.update({status:"blocked"});}}
 }
 async pause(){
  const epoch=++this.epoch;this.wantsPlayback=false;this.arbiter.release(this);
  try{await this.player.pause();if(this.epoch===epoch&&this.value.status!=="error")this.update({status:"paused"});}catch{if(this.epoch===epoch)this.update({status:"error"});}
 }
 async toggleSound(){if(this.disposed)return;const muted=!this.value.muted,epoch=this.epoch;try{await this.player.setMuted(muted);if(this.epoch===epoch)this.update({muted});}catch{if(this.epoch===epoch)this.fail();}}
 confirmPlaying(playing:boolean){if(this.disposed)return;if(playing&&(!this.wantsPlayback||!this.active||!this.pageVisible||!this.visible||this.automaticPlayback&&!this.autoplayEligible)){void this.pause();return;}if(!playing&&(this.value.status==="starting"||this.value.status==="error"))return;if(!playing){this.wantsPlayback=false;this.epoch++;this.arbiter.release(this);}this.update({status:playing?"playing":"paused"});}
 fail(){if(this.disposed||this.value.status==="error")return;this.epoch++;this.wantsPlayback=false;this.arbiter.release(this);this.update({status:"error"});void this.player.pause().catch(()=>undefined);}
 async dispose(){if(this.disposed)return;this.epoch++;this.disposed=true;this.arbiter.release(this);this.listeners.clear();try{await this.player.pause();}catch{/* Destroy still runs. */}await this.player.destroy();}
}
