/** Slot dimensions follow the existing CSS, including the free-height contain cap. */
export function squareImageSizes(ratio:number,columns=3,large=false,fit:'contain'|'cover'='cover',selection=false,fillMobile=false,strip=false){
 const factor=fit==='contain'?Math.min(1,ratio):Math.max(1,ratio),content='min(100vw, 1440px) - 2 * clamp(24px, 5vw, 80px)';
 const slot=(cols:number,gap:number,span=1)=>{
  const cell=strip&&cols>1?(cols===2?`calc((${content}) * .48)`:`max(240px, calc((${content}) * .32))`):`calc((${content} - ${(cols-1)*gap}px) / ${cols} * ${span} + ${(span-1)*gap}px)`;
  return fit==='contain'&&selection?`min(${cell}, ${ratio*80}svh)`:`calc(${cell} * ${factor})`;
 };
 const mobile=selection?767:600,tablet=selection?1000:950;
 const small=fillMobile?`${fit==='contain'?'min':'max'}(100vw, ${ratio*100}svh)`:slot(1,0);
 return `(max-width: ${mobile}px) ${small}, (max-width: ${tablet}px) ${slot(2,selection?32:24)}, ${slot(columns,32,large?2:1)}`;
}
export function detailImageSizes(ratio:number,fit:'contain'|'cover'='cover'){return `${fit==='contain'?'min':'max'}(100vw, ${ratio*100}svh)`;}
/** Portrait cover frames, including the proportional gaps of the 2×2 tiles. */
export function masonryImageSizes(ratio:number,columns=3,large=false){
 const factor=Math.max(1,ratio*1.25),content='min(100vw, 1440px) - 2 * clamp(24px, 5vw, 80px)';
 const slot=(width:string,cols:number,gap:number,span=1)=>`calc((${width} - ${(cols-1)*gap}px) / ${cols} * ${span} * ${factor} + ${(span-1)*gap*factor}px)`;
 return `(max-width: 600px) ${slot('100vw - 24px',1,0)}, (max-width: 767px) ${slot('100vw - 24px',2,8)}, (max-width: 950px) ${slot(content,2,16)}, ${slot(content,columns,16,large?2:1)}`;
}
