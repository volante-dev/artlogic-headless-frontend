export class EditorialSuspensions{
 private tokens=new Map<symbol,'surface'|'fullscreen'|'hidden'>();private listeners=new Set<()=>void>();
 snapshot=()=>this.tokens.size;
 foregroundFullscreen=()=>this.tokens.size>0&&[...this.tokens.values()].every(reason=>reason==='fullscreen');
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 acquire=(reason:'surface'|'fullscreen'|'hidden'='surface')=>{const token=Symbol(reason);this.tokens.set(token,reason);this.emit();return()=>{if(this.tokens.delete(token))this.emit();};};
 private emit(){for(const listener of this.listeners)listener();}
}
