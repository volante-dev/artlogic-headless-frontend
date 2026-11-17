'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {useSiteContent} from '../SiteContentProvider';
import {cartCount,changeCartQuantity,parseStoredCart,consumePaidCart,parseCartConfirmations,CART_TTL_MS,CartValidationSequence,type CartItem} from '../../lib/commerce/cart';
import type {components} from '../../lib/commerce/contract-types.generated';
type Product=components['schemas']['CommerceProductPublic'];type Validation=components['schemas']['CommerceCartValidation'];
interface CartContext {salesEnabled:boolean;items:readonly CartItem[];products:ReadonlyMap<string,Product>;count:number;subtotal:number;ready:boolean;pending:boolean;error:string|null;open:boolean;checkoutReady:boolean;paymentLocked:boolean;setPaymentLocked:(value:boolean)=>void;clearPurchased:(attemptId:string,lines:readonly CartItem[])=>void;setOpen:(value:boolean)=>void;change:(id:string,quantity:number,show?:boolean)=>Promise<boolean>;add:(product:Product,show?:boolean)=>Promise<boolean>;dismissError:()=>void}
const Context=createContext<CartContext|null>(null);
export function useCart(){const c=useContext(Context);if(!c)throw new Error('store_cart_provider_required');return c;}
export function CartProvider({siteId,initialProducts,checkoutReady,children,salesEnabled=true}:{salesEnabled?:boolean;siteId:string;initialProducts:Product[];checkoutReady:boolean;children:ReactNode}){
 const {locale,messages}=useSiteContent(),[items,setItems]=useState<CartItem[]>([]),[products,setProducts]=useState(()=>new Map(initialProducts.map(p=>[p.id,p]))),[ready,setReady]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<string|null>(null),[open,setOpen]=useState(false),[paymentLocked,setPaymentLocked]=useState(false);
 const confirmed=useRef<CartItem[]>([]),desired=useRef<CartItem[]>([]),sequence=useRef(new CartValidationSequence()),key='commerce:cart:'+siteId,productsRef=useRef(products);
 const save=useCallback((value:CartItem[])=>{confirmed.current=value;desired.current=value;setItems(value);try{localStorage.setItem(key,JSON.stringify({version:1,items:value,expiresAt:Date.now()+CART_TTL_MS}));}catch{/* The in-memory cart remains usable if storage is unavailable. */}},[key]);
 const completed=useRef(new Set<string>());
 const clearPurchased=useCallback((attemptId:string,lines:readonly CartItem[])=>{
  if(completed.current.has(attemptId))return;let previous:ReturnType<typeof parseCartConfirmations>=[];
  try{previous=parseCartConfirmations(localStorage.getItem(key+':confirmed'));}catch{/* The receipt remains in memory if storage is blocked. */}
  completed.current.add(attemptId);if(previous.some(r=>r.attemptId===attemptId))return;
  sequence.current.invalidate();save(consumePaidCart(confirmed.current,lines));setPending(false);setError(null);setPaymentLocked(false);
  try{localStorage.setItem(key+':confirmed',JSON.stringify([...previous,{attemptId,expiresAt:Date.now()+CART_TTL_MS}].slice(-256)));}catch{/* Confirmation receipts contain only opaque identifiers and expiry. */}
 },[key,save]);
 const hydrateProducts=useCallback(async(ids:readonly string[])=>{
  const missing=ids.filter(id=>!productsRef.current.has(id));
  for(let i=0;i<missing.length;i+=4){
   const resolved=await Promise.all(missing.slice(i,i+4).map(async id=>{try{const r=await fetch('/api/store/products/'+id+'?'+new URLSearchParams({locale}),{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(8000)});return r.ok?await r.json() as Product:null;}catch{return null;}}));
   const next=new Map(productsRef.current);for(const p of resolved)if(p&&typeof p.id==='string')next.set(p.id,p);productsRef.current=next;setProducts(next);
  }
 },[locale]);
 const validate=useCallback(async(candidate:CartItem[],show=false)=>{
  if(!salesEnabled)return false;const generation=sequence.current.next();setPending(true);setError(null);desired.current=candidate;
  if(candidate.length===0){save([]);setPending(false);return true;}
  try{
   const cartRevision=crypto.randomUUID(),response=await fetch('/api/store/cart/validate',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({items:candidate,locale,cartRevision}),signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('unavailable');const result=await response.json() as Validation;
   if(!sequence.current.current(generation))return false;
   if(result.cartRevision!==cartRevision||!Array.isArray(result.lines)||result.lines.length!==candidate.length||result.lines.some((l,i)=>l.productId!==candidate[i]?.productId||l.requestedQuantity!==candidate[i]?.quantity||l.status!=='valid'))throw new Error('stock');
   const next=new Map(productsRef.current);for(const line of result.lines){const p=next.get(line.productId);if(p&&line.grossUnitAmount!==undefined)next.set(line.productId,{...p,grossUnitAmount:line.grossUnitAmount,maxPurchasableQuantity:line.maxPurchasableQuantity});}productsRef.current=next;setProducts(next);
   save(candidate);if(show)setOpen(true);return true;
  }catch(e){if(sequence.current.current(generation)){desired.current=confirmed.current;setError(e instanceof Error&&e.message==='stock'?messages['commerce.unavailable']:locale==='fr'?'La vérification a échoué. Votre panier est conservé. Réessayez.':'Availability could not be checked. Your bag is preserved. Try again.');}return false;}
  finally{if(sequence.current.current(generation))setPending(false);}
 },[locale,messages,save,salesEnabled]);
 useEffect(()=>{
  let alive=true;const validationSequence=sequence.current;
  queueMicrotask(()=>{
   if(!alive)return;setReady(false);let stored:string|null=null;try{stored=localStorage.getItem(key);}catch{/* Private browsing may deny persistent storage. */}const restored=parseStoredCart(stored);
   const next=new Map(productsRef.current);for(const p of initialProducts)next.set(p.id,p);productsRef.current=next;setProducts(next);
   if(!restored){setReady(true);return;}
   confirmed.current=restored.items;desired.current=restored.items;setItems(restored.items);
   if(!salesEnabled){setOpen(false);setError(null);setReady(true);return;}
   void hydrateProducts(restored.items.map(i=>i.productId)).then(()=>alive?validate(restored.items):false).finally(()=>{if(alive)setReady(true);});
  });
  return()=>{alive=false;validationSequence.invalidate();};
 },[key,hydrateProducts,validate,initialProducts,salesEnabled]);
 const change=useCallback(async(id:string,quantity:number,show=false)=>{if(paymentLocked){setError(locale==='fr'?'Modifiez la commande depuis le paiement pour clôturer la tentative en cours.':'Edit the order from payment to close the current attempt.');return false;}try{return await validate(changeCartQuantity(desired.current,id,quantity),show);}catch{setError(messages['commerce.unavailable']);return false;}},[messages,validate,paymentLocked,locale]);
 const add=useCallback(async(product:Product,show=true)=>{const next=new Map(productsRef.current);next.set(product.id,product);productsRef.current=next;setProducts(next);return change(product.id,(desired.current.find(i=>i.productId===product.id)?.quantity??0)+1,show);},[change]);
 const subtotal=items.reduce((n,i)=>n+(products.get(i.productId)?.grossUnitAmount??0)*i.quantity,0);
 return <Context value={{salesEnabled,items,products,count:cartCount(items),subtotal,ready,pending,error,open,checkoutReady,paymentLocked,setPaymentLocked,clearPurchased,setOpen,change,add,dismissError:()=>setError(null)}}>{children}</Context>;
}
