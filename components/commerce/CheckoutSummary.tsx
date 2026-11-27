'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useRef,useState} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import type {components} from '../../lib/commerce/contract-types.generated';
import {useCart} from './CartProvider';
import {ResponsivePublicImage} from '../ResponsivePublicImage';
import styles from './Checkout.module.css';
gsap.registerPlugin(useGSAP);
type S=components['schemas'];
export function CheckoutSummary({quote,locale,delivery,receipt}:{receipt?:S['CommerceOrderConfirmation'];quote:S['CommerceQuote']|null;locale:string;delivery?:S['CommerceDeliveryPlan']|null}){
 const text=useRuntimeText();
 const cart=useCart(),money=(n:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(n/100),[expanded,setExpanded]=useState(false),[visible,setVisible]=useState(false),body=useRef<HTMLDivElement>(null);
 const verified=receipt??quote,lines=verified?verified.lines.map(l=>({id:l.productId,title:l.title,quantity:l.quantity,gross:l.gross})):cart.items.map(i=>({id:i.productId,title:cart.products.get(i.productId)?.title??(text("ui.634756a170e7433c")),quantity:i.quantity,gross:(cart.products.get(i.productId)?.grossUnitAmount??0)*i.quantity})),shipping=verified?.amounts.shippingGross??delivery?.shippingGross,total=verified?.amounts.totalGross??cart.subtotal+(shipping??0);
 useGSAP(()=>{const node=body.current;if(!node||!window.matchMedia('(max-width:950px)').matches)return;gsap.killTweensOf(node);const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(expanded)gsap.fromTo(node,{height:0,autoAlpha:0},{height:'auto',autoAlpha:1,duration:reduce?0:.4,ease:'power3.inOut',onComplete:()=>gsap.set(node,{clearProps:'height,opacity,visibility'})});else if(visible)gsap.to(node,{height:0,autoAlpha:0,duration:reduce?0:.3,ease:'power3.inOut',onComplete:()=>{setVisible(false);gsap.set(node,{clearProps:'height,opacity,visibility'});}});
 },{scope:body,dependencies:[expanded]});
 return <aside className={styles.summary} aria-label={text("ui.4b507f9ad08b8e99")}><button type='button' className={styles.summaryToggle} aria-expanded={expanded} aria-controls='checkout-summary-body' onClick={()=>{if(!expanded)setVisible(true);setExpanded(v=>!v);}}><span>{text("ui.7d223b829ebc30d7")} <span className={styles.secondary}>({lines.reduce((n,l)=>n+l.quantity,0)})</span></span><span>{money(total)}</span><svg viewBox='0 0 20 20' aria-hidden='true' style={{transform:expanded?'rotate(180deg)':undefined}}><path d='m4 7 6 6 6-6'/></svg></button>
 <div ref={body} id='checkout-summary-body' className={styles.summaryBody} data-open={visible||undefined}><h2>{receipt?(text("ui.4506e93ff37fec29")):(text("ui.7d223b829ebc30d7"))}</h2><ul className={styles.summaryProducts}>{lines.map(l=>{const product=cart.products.get(l.id),image=product?.images[0];return <li key={l.id} className={styles.summaryProduct+(!image?' '+styles.summaryTextProduct:'')}>{image&&<div className={styles.summaryImage}><ResponsivePublicImage resource={{resourceKind:'commerce',resourceId:image.assetId}} alt={image.alt} width={image.width} height={image.height} sizes='(max-width:950px) 100px, 210px' fallbackPath={image.src} directSource={{src:image.src,srcSet:image.variants.map(v=>v.url+' '+v.width+'w').join(', ')}}/></div>}<div><h3>{l.title}</h3>{product?.attributes.author&&<p>{product.attributes.author}</p>}<small>{text("commerce.quantity")} : {l.quantity}</small><span>{money(l.gross)}</span></div></li>;})}</ul>
 <dl className={styles.amounts}><div><dt>{text("commerce.subtotal")}</dt><dd>{money(verified?.amounts.itemsGross??cart.subtotal)}</dd></div><div><dt>{delivery?.mode==='pickup'?(text("ui.f8c6c23b6ff4f076")):delivery?.separateShipments?(text("store.delivery.parcelLabel",{count:delivery.groups.length})):(text("ui.97712ef6a2ae9c15"))}</dt><dd>{shipping===undefined?(text("ui.13451b79442bc107")):shipping===0?(text("ui.28e192eec2786e89")):money(shipping)}</dd></div>{verified&&<div className={styles.secondary}><dt>{text("ui.84eebb311d6410c0")}</dt><dd>{money(verified.amounts.itemsTax+verified.amounts.shippingTax)}</dd></div>}<div className={styles.total}><dt>{receipt?(text("ui.80735eaf73fd119e")):quote?(text("ui.a5b54530d3af83d9")):(text("ui.5a7a0bc871f97969"))}</dt><dd>{money(total)}</dd></div></dl>
 <p className={styles.summaryNote}>{quote?.importDisclosure??(receipt?(text("ui.6d633440598f017f")):(text("ui.c8c0728ad4ca16c2")))}</p></div></aside>;
}
