import type {CSSProperties} from 'react';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {Checkout} from './Checkout';
import {OrderConfirmation} from './OrderConfirmation';
import {OrderTracking} from './OrderTracking';
import {CartProvider} from './CartProvider';
import {StoreSubheader} from './StoreSubheader';
import {SiteHeader} from '../SiteHeader';
import {useSiteContent} from '../SiteContentProvider';
import {SiteThemeProvider} from '../../branding/SiteThemeProvider';
import {projectionTheme} from '../../clients/default/manifest';
import type {components} from '../../lib/commerce/contract-types.generated';
import type {StoreProduct} from '../../lib/commerce/catalog';
import {deliveryStoryData as data} from './delivery-fixtures.story';
import styles from './Store.module.css';
const photo={assetId:'32000000-0000-4000-8000-000000000003',src:'/commerce/forever.webp',alt:'Photographie de référence du Livre Forever',width:640,height:853,variants:[]};
const products=data.products.map((p,i)=>({...p,images:i===0?[photo]:[]})) as StoreProduct[];
const theme={...projectionTheme,colors:{...projectionTheme.colors,accent:'#6C5546',mutedText:'#6C5546'}};
function Journey({screen='checkout'}:{screen?:'checkout'|'confirmation'|'tracking'}){
 const {locale,defaultLocale,messages}=useSiteContent();
 return <SiteThemeProvider theme={theme} fonts={[]}><div style={{'--gallery-palette-primary-main':theme.colors.accent,'--gallery-palette-primary-mainChannel':'108 85 70'} as CSSProperties}><CartProvider siteId={data.siteId} initialProducts={products} checkoutReady><SiteHeader siteName='Galerie Lucas Ratton' locale={locale} defaultLocale={defaultLocale} messages={messages} section={null} storeHref='/store' storeActive logo={<span style={{letterSpacing:'.18em',fontSize:18,whiteSpace:'nowrap'}}>LUCAS RATTON</span>} navigation={{schemaVersion:1,scope:'public',revision:'1',releaseId:data.siteId,locale,items:[{pageKey:'news',href:'/news'},{pageKey:'artworks',href:'/artworks'},{pageKey:'exhibitions',href:'/exhibitions'},{pageKey:'publications',href:'/publications'},{pageKey:'galerist',name:'Lucas Ratton',href:'/lucas-ratton'},{pageKey:'expertise',href:'/expertise'},{pageKey:'contact',href:'/contact'}]}} languageControl={<span>FR / EN</span>}/><div className={styles.store}><StoreSubheader siteName='Galerie Lucas Ratton'/>{screen==='checkout'?<Checkout options={data.options as components['schemas']['CommerceCheckoutOptions']} termsHref='/terms'/>:screen==='confirmation'?<OrderConfirmation attemptId='32000000-0000-4000-8000-000000000077'/>:<OrderTracking/>}<p style={{fontSize:12,marginTop:32}}>Démonstration de composants, données synthétiques. Aucun paiement ni expédition.</p></div></CartProvider></div></SiteThemeProvider>;
}
const meta={title:'Store/Checkout journey',component:Journey,parameters:{layout:'fullscreen'},globals:{width:1440}} satisfies Meta<typeof Journey>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={args:{screen:'checkout'}};
export const Confirmation:Story={args:{screen:'confirmation'}};
export const Tracking:Story={args:{screen:'tracking'}};
