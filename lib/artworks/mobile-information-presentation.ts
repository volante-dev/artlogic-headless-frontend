export function informationPresentation(restored=false){
 let targetOpen=restored,progress=restored?1:0,epoch=0;
 return {get targetOpen(){return targetOpen;},get progress(){return progress;},get epoch(){return epoch;},get phase(){return !progress?"closed":!targetOpen?"returning":progress===1?"reading":progress<.72/1.88?"width":progress<1.64/1.88?"height":"reading";},
  target(open:boolean){targetOpen=open;},update(next:number){progress=Number.isFinite(next)?Math.min(1,Math.max(0,next)):0;},rebuild(){epoch++;},valid(value:number){return value===epoch;}};
}
