export interface FinaleRect {x:number;y:number;width:number;height:number}
export interface ImageSize {width:number;height:number}
/** Source bitmap rect, not CSS frame: this is the coordinate space retained at p=0. */
export function coverBitmap(frame:FinaleRect,image:ImageSize,focus:{x:number;y:number}={x:.5,y:.5}):FinaleRect{
 const scale=Math.max(frame.width/image.width,frame.height/image.height),width=image.width*scale,height=image.height*scale;
 return {x:frame.x+(frame.width-width)*focus.x,y:frame.y+(frame.height-height)*focus.y,width,height};
}
export function initialCrop(bitmap:FinaleRect,frame:FinaleRect):string{
 const top=Math.max(0,frame.y-bitmap.y),left=Math.max(0,frame.x-bitmap.x),bottom=Math.max(0,bitmap.y+bitmap.height-frame.y-frame.height),right=Math.max(0,bitmap.x+bitmap.width-frame.x-frame.width);
 return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

/** A common photographic frame, with a cover crop and no texture distortion. */
/** Mobile: a short band (top + height share of the viewport) between the page gutters. Keep in sync with ArtworkFinale.module.css. */
export const MOBILE_FINALE_BAND={top:40,height:.2,gutter:.07};
export function commonFinaleCardRect(viewport:FinaleRect,mobile:boolean,reference:ImageSize):FinaleRect{
 const maxWidth=viewport.width*(mobile?.62:.28),maxHeight=viewport.height*(mobile?MOBILE_FINALE_BAND.height:.72);
 const ratio=reference.width/reference.height;
 const width=Math.min(maxWidth,maxHeight*ratio),height=width/ratio;
 return {x:viewport.x+viewport.width*(mobile?MOBILE_FINALE_BAND.gutter:.57),y:viewport.y+(mobile?MOBILE_FINALE_BAND.top:(viewport.height-height)/2),width,height};
}
/**
 * Mobile stack spread: horizontal offset of each back layer (1..count) so the pile spans the page width
 * up to the right gutter, while consecutive cards still overlap. Accounts for the camera perspective,
 * which shrinks deeper layers toward the scene centre.
 */
export function mobileStackOffsets(viewport:FinaleRect,card:FinaleRect,count:number,depth:number,perspective:number):number[]{
 if(count<1)return [];
 const origin=viewport.x+viewport.width/2,right=viewport.x+viewport.width*(1-MOBILE_FINALE_BAND.gutter),front=card.x+card.width;
 const step=Math.min((right-front)/count,card.width*.9);
 return Array.from({length:count},(_,i)=>{const layer=i+1,shrink=perspective/(perspective+depth*layer),target=front+step*layer;return Math.max(0,origin+(target-origin)/shrink-front);});
}
export function coverCardTransform(bitmap:FinaleRect,card:FinaleRect){
 const scale=Math.max(card.width/bitmap.width,card.height/bitmap.height),width=bitmap.width*scale,height=bitmap.height*scale;
 const x=card.x-(width-card.width)/2,y=card.y-(height-card.height)/2;
 return {x:x-bitmap.x,y:y-bitmap.y,scale,clip:initialCrop(bitmap,{x:bitmap.x+(width-card.width)/2/scale,y:bitmap.y+(height-card.height)/2/scale,width:card.width/scale,height:card.height/scale})};
}
