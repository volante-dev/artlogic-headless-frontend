export interface CartItem {productId:string;quantity:number}
export interface StoredCart {version:1;items:CartItem[];expiresAt:number}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const CART_TTL_MS=7*24*60*60*1000;
export function parseStoredCart(raw:string|null,now=Date.now()):StoredCart|null{
 try{
  if(!raw||raw.length>10000)return null;const v=JSON.parse(raw);
  if(!v||Object.keys(v).sort().join(',')!=='expiresAt,items,version'||v.version!==1||!Number.isSafeInteger(v.expiresAt)||v.expiresAt<=now||v.expiresAt>now+CART_TTL_MS||!Array.isArray(v.items)||v.items.length>50)return null;
  const ids=new Set<string>();for(const item of v.items){if(!item||Object.keys(item).sort().join(',')!=='productId,quantity'||typeof item.productId!=='string'||!uuid.test(item.productId)||ids.has(item.productId.toLowerCase())||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99)return null;ids.add(item.productId.toLowerCase());}
  return {version:1,expiresAt:v.expiresAt,items:v.items.map((i:CartItem)=>({productId:i.productId.toLowerCase(),quantity:i.quantity}))};
 }catch{return null;}
}
export function changeCartQuantity(items:readonly CartItem[],productId:string,quantity:number):CartItem[]{
 if(!uuid.test(productId)||!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('validation_failed');
 const next=items.filter(i=>i.productId!==productId);if(quantity)next.push({productId,quantity});if(next.length>50)throw new Error('validation_failed');return next;
}
export function cartCount(items:readonly CartItem[]){return items.reduce((n,item)=>n+item.quantity,0);}
export function consumePaidCart(items:readonly CartItem[],paid:readonly CartItem[]){const purchased=new Map(paid.map(l=>[l.productId,l.quantity]));return items.flatMap(item=>{const quantity=Math.max(0,item.quantity-(purchased.get(item.productId)??0));return quantity?[{productId:item.productId,quantity}]:[];});}
export function parseCartConfirmations(raw:string|null,now=Date.now()):{attemptId:string;expiresAt:number}[]{
 try{if(!raw||raw.length>30000)return [];const value=JSON.parse(raw);if(!Array.isArray(value)||value.length>256)return [];return value.filter(v=>v&&Object.keys(v).sort().join(',')==='attemptId,expiresAt'&&typeof v.attemptId==='string'&&uuid.test(v.attemptId)&&Number.isSafeInteger(v.expiresAt)&&v.expiresAt>now&&v.expiresAt<=now+CART_TTL_MS).map(v=>({attemptId:v.attemptId as string,expiresAt:v.expiresAt as number}));}catch{return [];}
}
/** Older validation responses never overwrite a more recent user request. */
export class CartValidationSequence {private generation=0;next(){return ++this.generation;}current(generation:number){return generation===this.generation;}invalidate(){this.generation++;}}
