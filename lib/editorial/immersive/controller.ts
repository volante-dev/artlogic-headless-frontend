export type ReaderSnapshot={phase:'ready'|'preparing'|'transitioning';active:string;target:string|null;epoch:number;suspended:boolean;visited:readonly string[];initialized:boolean;enhanced:boolean;failed:boolean};
/** Framework-neutral controller; gesture identification and media loading are adapters. */
export class EditorialController{
 private listeners=new Set<()=>void>();private leases=new Set<symbol>();private ids:readonly string[];
 private state:ReaderSnapshot;
 constructor(ids:readonly string[],active=ids[0]){if(!active||!ids.includes(active))throw Error('editorial_views_required');this.ids=ids;this.state={phase:'ready',active,target:null,epoch:0,suspended:false,visited:[active],initialized:false,enhanced:false,failed:false};}
 initialize(enhanced:boolean){this.set({initialized:true,enhanced});}
 fail(){this.set({failed:true,phase:'ready',target:null,epoch:this.state.epoch+1});}
 snapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private set(patch:Partial<ReaderSnapshot>){this.state={...this.state,...patch};for(const listener of this.listeners)listener();}
 select(target:string,explicit=true){if(this.state.suspended||!this.ids.includes(target)||(!explicit&&this.state.phase!=='ready'))return false;if(target===this.state.active&&this.state.phase==='ready')return false;this.set({phase:'preparing',target,epoch:this.state.epoch+1,visited:this.state.visited.includes(target)?this.state.visited:[...this.state.visited,target]});return true;}
 step(direction:number){if(this.state.phase!=='ready'||this.state.suspended)return false;const index=this.ids.indexOf(this.state.active)+Math.sign(direction);const target=this.ids[index];return target?this.select(target,false):false;}
 prepared(epoch:number){if(epoch!==this.state.epoch||this.state.phase!=='preparing'||this.state.suspended)return false;this.set({phase:'transitioning'});return true;}
 finish(epoch:number){if(epoch!==this.state.epoch||this.state.phase!=='transitioning'||!this.state.target)return false;this.set({phase:'ready',active:this.state.target,target:null});return true;}
 suspend(){const key=Symbol('editorial-lease');this.leases.add(key);this.set({suspended:true,phase:'ready',active:this.state.phase==='transitioning'?(this.state.target??this.state.active):this.state.active,target:null,epoch:this.state.epoch+1});return()=>{if(!this.leases.delete(key))return;if(!this.leases.size)this.set({suspended:false});};}
 reconcile(ids:readonly string[],active:string){this.ids=ids;if(!ids.includes(active))throw Error('editorial_active_view_required');this.set({active,visited:this.state.visited.includes(active)?this.state.visited.filter(id=>ids.includes(id)):[...this.state.visited.filter(id=>ids.includes(id)),active],phase:'ready',target:null,epoch:this.state.epoch+1});}
 dispose(){this.listeners.clear();this.leases.clear();this.state={...this.state,epoch:this.state.epoch+1,phase:'ready',target:null};}
}
