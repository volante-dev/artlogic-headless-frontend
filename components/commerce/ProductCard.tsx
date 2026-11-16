'use client';
import {useState} from 'react';
import {ResponsivePublicImage} from '../ResponsivePublicImage';
import {useSiteContent} from '../SiteContentProvider';
import {useCart} from './CartProvider';
import type {StoreProduct} from '../../lib/commerce/catalog';
import styles from './Store.module.css';
export function ProductCard({product,eager=false}:{product:StoreProduct;eager?:boolean}){
 const {messages,locale}=useSiteContent(),cart=useCart(),[expanded,setExpanded]=useState(false),image=product.images[0],price=new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(product.grossUnitAmount/100);
 return <article className={styles.product}>
  <div className={styles.productImage}>{image&&<ResponsivePublicImage resource={{resourceKind:'commerce',resourceId:image.assetId}} alt={image.alt} width={image.width} height={image.height} eager={eager} sizes='(max-width: 639px) 100vw, (max-width: 1099px) 50vw, 33vw' fallbackPath={image.src} directSource={{src:image.src,srcSet:image.variants.map(v=>v.url+' '+v.width+'w').join(', ')}}/>}</div>
  <div className={styles.productHeading}><h2>{product.title}</h2><span>{price}</span></div>
  {product.attributes.author&&<p className={styles.productAuthor}>{product.attributes.author}</p>}
  <div className={styles.productControls}><button type='button' disabled={!cart.ready||cart.pending||product.availability!=='available'} onClick={()=>void cart.add(product)}>{product.availability==='available'?messages[cart.pending?'commerce.checking':'commerce.addToCart']:messages['commerce.unavailable']}</button><button type='button' className={styles.detailsToggle} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{locale==='fr'?'Détails':'Details'}</button></div>
  {expanded&&<div className={styles.productDescription}><p>{product.description}</p><p>{product.taxDisplayLabel}</p>{product.attributes.publisher&&<p>{product.attributes.publisher}</p>}{product.attributes.isbn&&<p>ISBN {product.attributes.isbn}</p>}</div>}
 </article>;
}
