export type InformationRect={left:number;top:number;width:number;height:number};
const positive=(n:number)=>Number.isFinite(n)?Math.max(0,n):0;
/** All inputs are measured CSS pixels. No media aspect ratio decides the panel layout. */
export function informationGeometry(input:{viewport:{width:number;height:number};closed:InformationRect;insets:{left:number;right:number;top:number;bottom:number};identityHeight:number;actionsHeight:number;lineHeight:number;padding:number;gap:number}){
 const {insets}=input,w=positive(input.viewport.width),h=positive(input.viewport.height);
 const left=Math.min(w,positive(input.closed.left)),bottom=Math.max(0,Math.min(h-positive(insets.bottom),positive(input.closed.top+input.closed.height)));
 const closed={left,top:Math.max(0,bottom-positive(input.closed.height)),width:Math.min(positive(input.closed.width),Math.max(0,w-left)),height:Math.min(positive(input.closed.height),bottom)};
 const open={left,top:positive(insets.top),width:Math.max(0,w-left-positive(insets.right)),height:Math.max(0,bottom-positive(insets.top))};
 const horizontal={...closed,width:open.width},padding=positive(input.padding),gap=positive(input.gap),minimumReaderHeight=2*positive(input.lineHeight);
 const sharedHeight=Math.max(0,open.height-2*padding-positive(input.actionsHeight)-gap);
 const normalHeight=Math.max(0,sharedHeight-positive(input.identityHeight)-gap),compact=normalHeight<minimumReaderHeight;
 return {closed,horizontal,open,compact,readerHeight:compact?sharedHeight:normalHeight,minimumReaderHeight,border:1 as const,identityOffset:closed.top-open.top};
}
