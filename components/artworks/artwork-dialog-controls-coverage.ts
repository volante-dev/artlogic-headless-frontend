export interface ControlsLease {update:(value:number)=>void;release:()=>void}
/** A stale cleanup can only release its own lease. */
export function controlsCoverage(apply:(value:number,active:boolean)=>void){
 const leases=new Map<symbol,number>();
 const render=()=>apply(Math.max(0,...leases.values()),leases.size>0);
 return {get active(){return leases.size>0;},acquire():ControlsLease{
  const key=Symbol();leases.set(key,0);render();return {update(value){if(!leases.has(key))return;leases.set(key,Number.isFinite(value)?Math.min(1,Math.max(0,value)):0);render();},release(){if(leases.delete(key))render();}};
 }};
}
