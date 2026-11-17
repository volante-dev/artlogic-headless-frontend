'use client';
import {useEffect,useLayoutEffect,useId,useRef,useState,type MouseEvent} from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {TransitionProps} from '@mui/material/transitions';
import {forwardRef} from 'react';
import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
import {ResponsivePublicImage} from '../ResponsivePublicImage';
import {useSiteContent} from '../SiteContentProvider';
import {useCart} from './CartProvider';
import type {StoreProduct} from '../../lib/commerce/catalog';
import styles from './ProductDialog.module.css';
gsap.registerPlugin(useGSAP);
const ProductSlide=forwardRef(function ProductSlide(props:TransitionProps&{children:React.ReactElement},ref:React.Ref<unknown>){return <Slide direction='left' easing={{enter:'cubic-bezier(.22,1,.36,1)',exit:'cubic-bezier(.22,1,.36,1)'}} ref={ref} {...props}/>;});
export function ProductDialog({product,open,onClose}:{product:StoreProduct;open:boolean;onClose:()=>void}){
 const {locale,messages}=useSiteContent(),cart=useCart(),title=useId(),reduced=useMediaQuery('(prefers-reduced-motion: reduce)'),mobile=useMediaQuery('(max-width:767px)'),showCart=useRef(false),backdrop=useRef<HTMLDivElement>(null);
 const {contextSafe}=useGSAP();
 function enterBackdrop(){contextSafe(()=>{if(backdrop.current)gsap.fromTo(backdrop.current,{backdropFilter:'blur(0px)',WebkitBackdropFilter:'blur(0px)'},{backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',duration:reduced?0:.48,ease:'power2.out',overwrite:'auto'});})();}
 function exitBackdrop(){contextSafe(()=>{if(backdrop.current)gsap.to(backdrop.current,{backdropFilter:'blur(0px)',WebkitBackdropFilter:'blur(0px)',duration:reduced?0:.34,ease:'power2.out',overwrite:'auto'});})();}
 const added=()=>{showCart.current=true;onClose();};
 const afterExit=()=>{if(showCart.current){showCart.current=false;cart.setOpen(true);}};
 return <Dialog open={open} onClose={onClose} aria-labelledby={title} maxWidth={false} fullScreen={mobile} className={styles.dialog}
  slots={{transition:ProductSlide}} transitionDuration={reduced?0:{enter:480,exit:340}}
  slotProps={{paper:{className:styles.paper},backdrop:{className:styles.backdrop,ref:backdrop},transition:{onEnter:enterBackdrop,onExit:exitBackdrop,onExited:afterExit}}}>
  <ProductPanel product={product} titleId={title} closing={!open} reduced={reduced} onClose={onClose} onAdded={added} locale={locale} closeLabel={messages['commerce.close']}/>
 </Dialog>;
}
function ProductPanel({product,titleId,closing,reduced,onClose,onAdded,locale,closeLabel}:{product:StoreProduct;titleId:string;closing:boolean;reduced:boolean;onClose:()=>void;onAdded:()=>void;locale:string;closeLabel:string}){
 const {messages}=useSiteContent(),cart=useCart(),fr=locale.startsWith('fr'),[expanded,setExpanded]=useState(false),[index,setIndex]=useState(0),rail=useRef<HTMLDivElement>(null),currentIndex=useRef(0),card=useRef<HTMLElement>(null),details=useRef<HTMLDivElement>(null),detailsBody=useRef<HTMLDivElement>(null),timeline=useRef<gsap.core.Timeline|null>(null),detailsId=useId(),instant=useRef(false),engaged=useRef(false),glass=useRef<HTMLDivElement>(null),price=new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(product.grossUnitAmount/100);
 useGSAP(()=>{
  if(!card.current||!glass.current)return;
  gsap.fromTo(card.current,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:reduced?0:.36,delay:reduced?0:.12,ease:'power3.out'});
  gsap.fromTo(glass.current,{'--product-glass-alpha':'0%',backdropFilter:'blur(0px)',WebkitBackdropFilter:'blur(0px)'},{'--product-glass-alpha':'62%',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',duration:reduced?0:.48,ease:'power2.out'});
 },{scope:card});
 useGSAP(()=>{
  const viewport=details.current,body=detailsBody.current;if(!viewport||!body)return;
  timeline.current?.kill();const duration=reduced||instant.current?0:.36;instant.current=false;
  timeline.current=gsap.timeline({defaults:{ease:'power3.out'}})
   .to(viewport,{height:expanded?body.getBoundingClientRect().height:0,duration},0)
   .to(body,{autoAlpha:expanded?1:0,y:expanded?0:8,duration:duration?(expanded ? .22 : .14):0},expanded&&duration ? .08 : 0);
  if(engaged.current&&glass.current)timeline.current.to(glass.current,{'--product-glass-alpha':expanded?'82%':'62%',backdropFilter:expanded?'blur(16px)':'blur(10px)',WebkitBackdropFilter:expanded?'blur(16px)':'blur(10px)',duration,overwrite:'auto'},0);
  timeline.current.eventCallback('onComplete',()=>{if(expanded)gsap.set(viewport,{height:body.getBoundingClientRect().height});});
 },{scope:card,dependencies:[expanded,reduced]});
 useLayoutEffect(()=>{
  const info=card.current,body=detailsBody.current,stage=info?.closest<HTMLElement>('[data-product-dialog]');if(!info||!body||!stage)return;
  const identity=info.querySelector('header')!,purchase=info.querySelector('footer')!;
  const measure=()=>{const css=getComputedStyle(info),footer=getComputedStyle(purchase),available=stage.clientHeight-110-identity.getBoundingClientRect().height-purchase.getBoundingClientRect().height-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-parseFloat(footer.marginTop);body.style.setProperty('--product-details-budget',Math.max(80,available)+'px');};
  measure();const resize=new ResizeObserver(measure);resize.observe(stage);resize.observe(identity);resize.observe(purchase);return()=>resize.disconnect();
 },[]);
 useEffect(()=>{
  const viewport=details.current,body=detailsBody.current;if(!viewport||!body)return;
  const resize=new ResizeObserver(()=>{if(expanded&&!timeline.current?.isActive())gsap.set(viewport,{height:body.getBoundingClientRect().height});});resize.observe(body);return()=>resize.disconnect();
 },[expanded]);
 useEffect(()=>{
  const node=rail.current;if(!node)return;let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const next=Math.max(0,Math.min(product.images.length-1,Math.round(node.scrollLeft/Math.max(1,node.clientWidth))));currentIndex.current=next;setIndex(next);});};
  let width=node.clientWidth;const resize=new ResizeObserver(()=>{if(width===node.clientWidth)return;width=node.clientWidth;node.scrollTo({left:currentIndex.current*width,behavior:'instant'});});resize.observe(node);node.addEventListener('scroll',update,{passive:true});
  return()=>{cancelAnimationFrame(frame);resize.disconnect();node.removeEventListener('scroll',update);};
 },[product.images.length]);
 function showImage(next:number){rail.current?.scrollTo({left:next*(rail.current?.clientWidth??0),behavior:reduced?'instant':'smooth'});}
 async function add(){if(await cart.add(product,false))onAdded();}
 const detailToggle=(event:MouseEvent<HTMLButtonElement>)=>{instant.current=event.detail===0;engaged.current=true;setExpanded(value=>!value);};
 return <div className={styles.stage} data-product-dialog data-details-open={expanded||undefined}>
  <div className={styles.rail} ref={rail} role='region' aria-roledescription={fr?'carrousel':'carousel'} aria-label={fr?'Photographies du produit':'Product photographs'} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showImage(Math.max(0,Math.min(product.images.length-1,index+(event.key==='ArrowRight'?1:-1))));}}} tabIndex={product.images.length>1?0:undefined}>
   {product.images.map((image,i)=><div className={styles.slide} key={image.assetId} role='group' aria-roledescription='slide' aria-label={(i+1)+' / '+product.images.length}>
    <ResponsivePublicImage resource={{resourceKind:'commerce',resourceId:image.assetId}} slot={'product-dialog:'+product.id+':'+i} alt={image.alt} width={image.width} height={image.height} eager={i<2} sizes='(max-width: 767px) 100vw, 60vw' fallbackPath={image.src} directSource={{src:image.src,srcSet:image.variants.map(v=>v.url+' '+v.width+'w').join(', ')}}/>
   </div>)}
  </div>
  <button type='button' className={styles.close} aria-label={closeLabel} onClick={onClose} disabled={closing} autoFocus><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.25' aria-hidden='true'><path d='m5 5 14 14M19 5 5 19'/></svg></button>
  <div className={styles.dock}>
   {product.images.length>1&&<nav className={styles.dots} aria-label={fr?'Choisir une photographie':'Choose a photograph'}>{product.images.map((image,i)=><button type='button' key={image.assetId} aria-label={(fr?'Photographie ':'Photograph ')+(i+1)} aria-current={index===i?'true':undefined} onClick={()=>showImage(i)}><span/></button>)}</nav>}
   <section ref={card} className={styles.information} aria-label={fr?'Informations du produit':'Product information'}>
    <div className={styles.surface} ref={glass} data-product-glass aria-hidden='true'/>
    <header className={styles.identity}><h2 id={titleId}>{product.title}</h2>{product.attributes.author&&<p>{product.attributes.author}</p>}</header>
    <div id={detailsId} className={styles.details} ref={details} aria-hidden={!expanded} inert={!expanded||undefined}><div className={styles.detailsBody} ref={detailsBody} data-product-details-scroll>
     <p className={styles.description}>{product.description}</p>
     <dl>{([['publisher',fr?'Éditeur':'Publisher'],['isbn','ISBN'],['format',fr?'Format':'Format']] as const).map(([key,label])=>product.attributes[key]?<div key={key}><dt>{label}</dt><dd>{product.attributes[key]}</dd></div>:null)}</dl>
    </div></div>
    <footer className={styles.purchase}><div className={styles.price}><span>{price}</span><small>{product.taxDisplayLabel}</small></div>
     <button type='button' className={styles.add} disabled={closing||!cart.ready||cart.pending||!cart.salesEnabled||cart.paymentLocked||product.availability!=='available'} onClick={()=>void add()}>{product.availability==='available'?messages[cart.pending?'commerce.checking':'commerce.addToCart']:messages['commerce.unavailable']}</button>
     <button type='button' className={styles.toggle} onClick={detailToggle} aria-expanded={expanded} aria-controls={detailsId} disabled={closing}><span className={styles.toggleLabels}><span className={styles.toggleSizer} aria-hidden='true'>{fr?'Fermer les détails':'Close details'}</span><span>{expanded?(fr?'Fermer les détails':'Close details'):(fr?'Détails':'Details')}</span></span><svg viewBox='0 0 16 16' aria-hidden='true'><path d={expanded?'M3 8h10':'M3 8h10M8 3v10'}/></svg></button>
    </footer>
    {cart.error&&<p role='alert' className={styles.error}>{cart.error}</p>}
   </section>
  </div>
 </div>;
}
