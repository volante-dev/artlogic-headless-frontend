import {useState} from 'react';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {ProductCard} from './ProductCard';
import {CartProvider} from './CartProvider';
import {StoreSubheader} from './StoreSubheader';
import {ConsentBanner} from '../privacy/ConsentBanner';
import {useSiteContent} from '../SiteContentProvider';
import type {StoreProduct} from '../../lib/commerce/catalog';
import styles from './Store.module.css';
const photo={assetId:'32000000-0000-4000-8000-000000000003',src:'/commerce/forever.webp',alt:'Livre Forever sur son socle dans la galerie',width:640,height:853,variants:[]};
const storyProduct:StoreProduct={id:'32000000-0000-4000-8000-000000000001',sku:'REFERENCE-FOREVER',kind:'book',title:'Livre Forever',description:'Book',attributes:{author:'Galerie Lucas Ratton',publisher:'Galerie Lucas Ratton'},grossUnitAmount:5000,currency:'EUR',taxDisplayLabel:'Taxes incluses',availability:'available',maxPurchasableQuantity:5,images:[photo]};
function ProductStory({long=false,many=false,consent=true}:{long?:boolean;many?:boolean;consent?:boolean}){
 const {locale}=useSiteContent(),[banner,setBanner]=useState(consent),product={...storyProduct,...(long?{description:Array.from({length:18},()=> 'Texte de démonstration pour vérifier la lecture et le défilement des informations du produit.').join('\n\n')}:{}),images:many?Array.from({length:10},(_,i)=>({...photo,assetId:'32000000-0000-4000-8000-'+String(i+3).padStart(12,'0'),alt:'Photographie répétée pour tester le carrousel '+(i+1)})):[photo]};
 return <CartProvider siteId='32000000-0000-4000-8000-000000000099' initialProducts={[product]} checkoutReady>
  <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'28px clamp(20px,3.5vw,50px)',borderBottom:'1px solid var(--site-color-border)',gap:24}}><span style={{letterSpacing:'.15em',fontSize:18}}>LUCAS RATTON</span><span style={{fontSize:14}}>Actualités · Œuvres · Expositions · Store</span></header>
  <main className={styles.store} style={{minHeight:1600}}><StoreSubheader siteName='Galerie Lucas Ratton'/><div className={styles.grid}><ProductCard product={product} eager/></div></main>
  {banner&&<ConsentBanner locale={locale} optional accept={()=>setBanner(false)} reject={()=>setBanner(false)} personalise={()=>setBanner(false)} dismiss={()=>setBanner(false)}/>}
 </CartProvider>;
}
const meta={title:'Store/Product immersion',component:ProductStory,parameters:{layout:'fullscreen'},tags:['autodocs']} satisfies Meta<typeof ProductStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const LongDetails:Story={args:{long:true,many:true}};
export const WithoutConsent:Story={args:{consent:false}};
