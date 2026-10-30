/** Contact lifetime, not an idle timer or the animation duration, defines a touch gesture. */
export class ArtworkTouchGesture {
 private pointer:number|null=null;private x=0;private y=0;private consumed=false;
 start(pointer:number,x:number,y:number,blocked=false){if(this.pointer!==null){this.cancel();this.consumed=true;return;}this.pointer=pointer;this.x=x;this.y=y;this.consumed=blocked;}
 move(pointer:number,x:number,y:number):number{if(this.pointer!==pointer||this.consumed)return 0;const dx=x-this.x,dy=this.y-y;if(Math.abs(dy)<24||Math.abs(dy)<Math.abs(dx)*1.25)return 0;this.consumed=true;return Math.sign(dy);}
 end(pointer:number){if(this.pointer===pointer)this.cancel();}
 cancel(){this.pointer=null;this.consumed=false;}
}
