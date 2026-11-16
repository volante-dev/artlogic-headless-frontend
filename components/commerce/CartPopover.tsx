'use client';
import {useLayoutEffect,useRef,useState,useSyncExternalStore,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {HeaderLink} from '../header/HeaderLink';
import {useSiteContent} from '../SiteContentProvider';
import {localizedPath} from '../../lib/i18n/routes';
import {useCart} from './CartProvider';
import styles from './Store.module.css';
const currency=(value:number,locale:string)=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(value/100);
const subscribe=()=>()=>{},clientSnapshot=()=>true,serverSnapshot=()=>false;
export function CartPopover({anchorRef}:{anchorRef:RefObject<HTMLButtonElement|null>}){
 const cart=useCart(),{open,setOpen}=cart,{messages,locale,defaultLocale}=useSiteContent(),panel=useRef<HTMLDivElement>(null),mounted=useSyncExternalStore(subscribe,clientSnapshot,serverSnapshot),[position,setPosition]=useState({top:0,right:20});
 useLayoutEffect(()=>{
  if(!open)return;
  const update=()=>{const r=anchorRef.current?.getBoundingClientRect();if(r){const width=Math.min(420,innerWidth-32);setPosition({top:Math.max(12,Math.min(r.bottom+12,innerHeight-160)),right:Math.min(innerWidth-width-16,Math.max(16,innerWidth-r.right))});}};update();
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!panel.current?.contains(event.target)&&!anchorRef.current?.contains(event.target))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);anchorRef.current?.focus({preventScroll:true});}};
  window.addEventListener('resize',update);window.addEventListener('scroll',update,true);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open,anchorRef,setOpen]);
 if(!mounted)return null;
 return createPortal(<div ref={panel} id='store-cart' role='dialog' aria-label={messages['commerce.cart']} className={styles.popover} data-open={cart.open||undefined} inert={!cart.open||undefined} aria-hidden={!cart.open} style={{top:position.top,right:position.right,maxHeight:`calc(100dvh - ${position.top+16}px)`}}>
  <div className={styles.popoverTop}><h2>{messages['commerce.cart']} <span>({cart.count})</span></h2><button type='button' aria-label={messages['commerce.close']} onClick={()=>{cart.setOpen(false);anchorRef.current?.focus({preventScroll:true});}} className={styles.close}><svg viewBox='0 0 24 24' aria-hidden='true'><path d='m5 5 14 14M19 5 5 19'/></svg></button></div>
  <div className={styles.cartBody}>
   {!cart.items.length?<p>{messages['commerce.emptyCart']}</p>:<ul className={styles.cartLines}>{cart.items.map(item=>{
    const product=cart.products.get(item.productId);
    return <li key={item.productId}><div className={styles.cartLineTitle}><span>{product?.title??messages['commerce.unavailable']}</span><span>{product?currency(product.grossUnitAmount*item.quantity,locale):''}</span></div>
     <div className={styles.quantityRow}><label>{messages['commerce.quantity']}<input type='number' min={1} max={99} inputMode='numeric' defaultValue={item.quantity} key={item.quantity} disabled={cart.pending||cart.paymentLocked} onBlur={async event=>{const input=event.currentTarget,n=Number(input.value);if(n!==item.quantity&&!await cart.change(item.productId,n)&&input.isConnected)input.value=String(item.quantity);}} onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}}/></label><button type='button' disabled={cart.pending||cart.paymentLocked} onClick={()=>void cart.change(item.productId,0)}>{messages['commerce.remove']}</button></div>
    </li>;
   })}</ul>}
  </div>
  {cart.error&&<p className={styles.error} role='alert'>{cart.error}</p>}
  {cart.items.length>0&&<div className={styles.cartBottom}><p><span>{messages['commerce.subtotal']}</span><strong>{currency(cart.subtotal,locale)}</strong></p>{cart.checkoutReady&&!cart.error&&!cart.pending?<HeaderLink className='button' href={localizedPath('/store/checkout',locale,defaultLocale)} onAccepted={()=>cart.setOpen(false)}>{messages['commerce.checkout']}</HeaderLink>:<button type='button' disabled>{messages['commerce.checkout']}</button>}</div>}
 </div>,document.body);
}
