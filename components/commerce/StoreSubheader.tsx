'use client';
import {HeaderLink} from '../header/HeaderLink';
import {useSiteContent} from '../SiteContentProvider';
import {localizedPath} from '../../lib/i18n/routes';
import {useCart} from './CartProvider';
import {CartPopover} from './CartPopover';
import styles from './Store.module.css';
import {useRef} from 'react';
export function StoreSubheader({siteName}:{siteName:string}){
 const {locale,defaultLocale,messages}=useSiteContent(),cart=useCart(),buttonRef=useRef<HTMLButtonElement>(null);
 return <><div className={styles.subheader}>
  <h1>{cart.salesEnabled?<HeaderLink href={localizedPath('/store',locale,defaultLocale)}>{siteName} <span>Store</span></HeaderLink>:<>{siteName} <span>Store</span></>}</h1>
  <nav aria-label={messages['commerce.store']} className={styles.actions}>
   {cart.salesEnabled&&<button type='button' ref={buttonRef} aria-haspopup='dialog' aria-expanded={cart.open} aria-controls='store-cart' onClick={()=>cart.setOpen(!cart.open)}>{messages['commerce.cart']} <span className={styles.count} aria-live='polite'>{cart.count}</span></button>}
   <HeaderLink href={localizedPath('/store/order-tracking',locale,defaultLocale)}>{messages['commerce.orderTracking']}</HeaderLink>
  </nav>
  {cart.salesEnabled&&<CartPopover anchorRef={buttonRef}/>}
 </div>{cart.error&&!cart.open&&<p className={styles.storeError} role='alert'>{cart.error}</p>}</>;
}
