import {unit} from "./artwork-mobile-state";
export function examinationGeometry(w:number,h:number,vw:number,vh:number,zoom:1|2){
 const scale=zoom===1?Math.min(vw/Math.max(w,1),vh/Math.max(h,1)):2*Math.max(vw/Math.max(w,1),vh/Math.max(h,1));
 const width=w*scale,height=h*scale;return {width,height,limitX:Math.max(0,(width-vw)/2),limitY:Math.max(0,(height-vh)/2)};
}
export function relativePan(origin:{x:number;y:number},dx:number,dy:number,g:{limitX:number;limitY:number}){return {x:g.limitX?unit(origin.x+dx/g.limitX):0,y:g.limitY?unit(origin.y+dy/g.limitY):0};}
