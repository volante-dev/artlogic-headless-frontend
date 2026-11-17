'use client';
import {useLayoutEffect,useRef,useState,useSyncExternalStore,type RefObject} from 'react';
import {Fade,Modal,useMediaQuery} from '@mui/material';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {ResponsivePublicImage} from '../ResponsivePublicImage';
import {HeaderLink} from '../header/HeaderLink';
import {useSiteContent} from '../SiteContentProvider';
import {localizedPath} from '../../lib/i18n/routes';
import {useCart} from './CartProvider';
import styles from './Store.module.css';
gsap.registerPlugin(useGSAP);
const currency=(value:number,locale:string)=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(value/100);
const subscribe=()=>()=>{},clientSnapshot=()=>true,serverSnapshot=()=>false;
export function CartPopover({anchorRef}:{anchorRef:RefObject<HTMLButtonElement|null>}){
 const reducedMotion=useMediaQuery('(prefers-reduced-motion: reduce)'),cart=useCart(),{open,setOpen}=cart,{messages,locale,defaultLocale}=useSiteContent(),panel=useRef<HTMLDivElement>(null),openedOnce=useRef(false),backdrop=useRef<HTMLDivElement>(null),mounted=useSyncExternalStore(subscribe,clientSnapshot,serverSnapshot),[position,setPosition]=useState({top:0,right:20});
 useLayoutEffect(()=>{
  if(!open)return;
  const update=()=>{const r=anchorRef.current?.getBoundingClientRect();if(r){const width=Math.min(420,innerWidth-32);setPosition({top:Math.max(12,Math.min(r.bottom+12,innerHeight-160)),right:Math.min(innerWidth-width-16,Math.max(16,innerWidth-r.right))});}};update();
  window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
 },[open,anchorRef,setOpen]);
 useGSAP(()=>{const node=panel.current;if(!node)return;if(!cart.open&&!openedOnce.current)return;if(cart.open)openedOnce.current=true;gsap.killTweensOf(node);const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;gsap.fromTo(node,cart.open?{y:-10,clipPath:'inset(0 0 100% 0)'}:{y:0,clipPath:'inset(0 0 0% 0)'},{y:cart.open?0:-8,clipPath:cart.open?'inset(0 0 0% 0)':'inset(0 0 100% 0)',duration:reduce?0:cart.open ? .6 : .3,ease:'power3.inOut'});if(backdrop.current)gsap.fromTo(backdrop.current,{backdropFilter:cart.open?'blur(0px)':'blur(5px)'},{backdropFilter:cart.open?'blur(5px)':'blur(0px)',duration:reduce?0:cart.open ? .4 : .35,ease:'power2.inOut'});},{scope:panel,dependencies:[cart.open,mounted]});
 if(!mounted)return null;
 return <Modal open={cart.open} onClose={()=>setOpen(false)} keepMounted closeAfterTransition disableRestoreFocus slotProps={{backdrop:{className:styles.cartBackdrop,ref:backdrop,transitionDuration:reducedMotion?0:350}}}><Fade in={cart.open} timeout={reducedMotion?0:{enter:600,exit:350}} onExited={()=>anchorRef.current?.focus({preventScroll:true})}><div ref={panel} tabIndex={-1} aria-modal='true' id='store-cart' role='dialog' aria-label={messages['commerce.cart']} className={styles.popover} data-open={cart.open||undefined} inert={!cart.open||undefined} aria-hidden={!cart.open} style={{top:position.top,right:position.right,maxHeight:`calc(100dvh - ${position.top+16}px)`}}>
  <div className={styles.popoverTop}><h2>{messages['commerce.cart']} <span>({cart.count})</span></h2><button type='button' aria-label={messages['commerce.close']} onClick={()=>cart.setOpen(false)} className={styles.close}><svg viewBox='0 0 24 24' aria-hidden='true'><path d='m5 5 14 14M19 5 5 19'/></svg></button></div>
  <div className={styles.cartBody}>
   {!cart.items.length?<p>{messages['commerce.emptyCart']}</p>:<ul className={styles.cartLines}>{cart.items.map(item=>{
    const product=cart.products.get(item.productId),image=product?.images[0];
    return <li key={item.productId}><div className={styles.cartProductRow}>{image&&<div className={styles.cartImage}><ResponsivePublicImage resource={{resourceKind:'commerce',resourceId:image.assetId}} alt={image.alt} width={image.width} height={image.height} sizes='80px' fallbackPath={image.src} directSource={{src:image.src,srcSet:image.variants.map(v=>v.url+' '+v.width+'w').join(', ')}}/></div>}<div className={styles.cartProductInfo}><div className={styles.cartLineTitle}><span>{product?.title??messages['commerce.unavailable']}</span><span>{product?currency(product.grossUnitAmount*item.quantity,locale):''}</span></div>
     <div className={styles.quantityRow}><label>{messages['commerce.quantity']}<input type='number' min={1} max={99} inputMode='numeric' defaultValue={item.quantity} key={item.quantity} disabled={cart.pending||cart.paymentLocked} onBlur={async event=>{const input=event.currentTarget,n=Number(input.value);if(n!==item.quantity&&!await cart.change(item.productId,n)&&input.isConnected)input.value=String(item.quantity);}} onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}}/></label><button type='button' disabled={cart.pending||cart.paymentLocked} onClick={()=>void cart.change(item.productId,0)}>{messages['commerce.remove']}</button></div>
    </div></div></li>;
   })}</ul>}
  </div>
  {cart.paymentLocked&&<p className={styles.cartLocked}>{locale==='fr'?'Revenez à la modification de votre commande pour changer le panier.':'Return to editing your order to change your bag.'}</p>}
  {cart.error&&<p className={styles.error} role='alert'>{cart.error}</p>}
  {cart.items.length>0&&<div className={styles.cartBottom}><p><span>{messages['commerce.subtotal']}</span><strong>{currency(cart.subtotal,locale)}</strong></p>{cart.checkoutReady&&!cart.error&&!cart.pending?<HeaderLink className='button' href={localizedPath('/store/checkout',locale,defaultLocale)} onAccepted={()=>cart.setOpen(false)}>{messages['commerce.checkout']}</HeaderLink>:<button type='button' disabled>{messages['commerce.checkout']}</button>}</div>}
 </div></Fade></Modal>;
}
