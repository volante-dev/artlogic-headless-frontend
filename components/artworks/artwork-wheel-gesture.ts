import {WheelGestures,type WheelEventData} from "wheel-gestures";
/** One physical gesture owns one step, including its inertial tail. */
export function createArtworkWheelGesture(){
 const detector=WheelGestures({preventWheelAction:false,reverseSign:false});
 let claimed=false,momentum=false,direction=0;
 const unsubscribe=detector.on("wheel",state=>{
  if(state.isEnding)return;
  if(state.isStart){claimed=false;direction=0;}
  momentum=state.isMomentum;
 });
 return {
  accept(event:WheelEventData):boolean{
   const nextDirection=Math.sign(event.deltaY),reversed=direction!==0&&nextDirection!==0&&direction!==nextDirection;
   detector.feedWheel(event);
   if(!nextDirection||event.momentum===true||momentum&&!reversed||claimed&&!reversed)return false;
   claimed=true;direction=nextDirection;return true;
  },
  dispose(){unsubscribe();detector.disconnect();},
 };
}
