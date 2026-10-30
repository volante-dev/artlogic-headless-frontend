import {artworkStageOffsets} from "./artwork-progress";
export const artworkScrollDuration=600;
const epsilon=1;
/** Only the long-text reading interval and content after the scene scroll freely. */
export function artworkScrollTarget(y:number,viewport:number,reading:number,count:number,direction:number):number|null{
 const offsets=artworkStageOffsets(viewport,reading,count);
 if(direction>0){
  if(y<viewport-epsilon)return viewport;
  if(y<reading-epsilon)return null;
  return offsets.slice(1).find(offset=>offset>y+epsilon)??null;
 }
 if(direction<0){
  if(y>offsets.at(-1)!+epsilon&&count>1)return null;
  for(const offset of offsets.slice(1).reverse())if(y>offset+epsilon)return offset;
  if(y>reading+epsilon)return reading;
  if(y>viewport+epsilon)return null;
  return y>epsilon?0:null;
 }
 return null;
}
export function artworkScrollUnsettled(y:number,viewport:number,reading:number,count:number):boolean{
 if(y>1&&y<viewport-1)return true;
 if(y<=reading+1)return false;
 const offsets=artworkStageOffsets(viewport,reading,count).slice(1);
 return y< (offsets.at(-1)??reading)-1&&!offsets.some(offset=>Math.abs(offset-y)<=1);
}
export function artworkScrollEase(t:number):number{return 1-Math.pow(1-Math.min(1,Math.max(0,t)),4);}
