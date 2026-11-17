'use client';
import {useId,useState} from 'react';
import {ResponsivePublicImage} from '../ResponsivePublicImage';
import {useSiteContent} from '../SiteContentProvider';
import {useCart} from './CartProvider';
import {ProductDialog} from './ProductDialog';
import type {StoreProduct} from '../../lib/commerce/catalog';
import styles from './Store.module.css';
export function ProductCard({product,eager=false}:{product:StoreProduct;eager?:boolean}){
 const {locale}=useSiteContent(),cart=useCart(),[open,setOpen]=useState(false),title=useId(),image=product.images[0],price=new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(product.grossUnitAmount/100);
 function show(){cart.setOpen(false);setOpen(true);}
 return <article className={styles.product}>
  <button type='button' className={styles.productOpen} aria-labelledby={title} aria-haspopup='dialog' onClick={show}><span className={styles.productImage}>{image&&<ResponsivePublicImage resource={{resourceKind:'commerce',resourceId:image.assetId}} alt={image.alt} width={image.width} height={image.height} eager={eager} sizes='(max-width: 639px) 100vw, (max-width: 1099px) 50vw, 33vw' fallbackPath={image.src} directSource={{src:image.src,srcSet:image.variants.map(v=>v.url+' '+v.width+'w').join(', ')}}/>}</span></button>
  <div className={styles.productHeading}><h2 id={title}>{product.title}</h2><span>{price}</span></div>
  {product.attributes.author&&<p className={styles.productAuthor}>{product.attributes.author}</p>}
  <div className={styles.productControls}><button type='button' className={styles.detailsToggle} onClick={show} aria-haspopup='dialog'>{locale.startsWith('fr')?'Détails':'Details'}</button></div>
  <ProductDialog product={product} open={open} onClose={()=>setOpen(false)}/>
 </article>;
}
