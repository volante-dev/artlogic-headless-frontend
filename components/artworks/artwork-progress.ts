const clamp=(n:number)=>Math.min(1,Math.max(0,n));
export function artworkStageOffsets(viewport:number,reading:number,count:number):number[]{
  return Array.from({length:Math.max(1,count)},(_,index)=>index===0?0:viewport+reading+(index-1)*viewport);
}
export function artworkProgress(scroll:number,viewport:number,reading:number,count:number){
  const offsets=artworkStageOffsets(viewport,reading,count);
  let active=0;for(let i=1;i<offsets.length;i++)if(scroll>=offsets[i]!-.5)active=i;
  return {transition:clamp(scroll/Math.max(1,viewport)),active};
}
