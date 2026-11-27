import {runtimeText,hasRuntimeModule,type SiteMessages} from '../i18n/site-messages';
export function storePageMetadata(kind:'catalog'|'checkout'|'tracking'|'confirmation',site:{messages:SiteMessages;locale:string;siteName:string}){
 if(!hasRuntimeModule(site.messages,site.locale,'store'))return {title:site.siteName};
 const keys={catalog:['store.meta.description','store.meta.description'],checkout:['store.meta.checkoutTitle','store.meta.checkoutDescription'],tracking:['commerce.orderTracking','store.meta.trackingDescription'],confirmation:['store.meta.confirmationTitle','store.meta.confirmationDescription']} as const;
 const text=(id:typeof keys[typeof kind][number])=>runtimeText(site.messages,site.locale,id,id==='store.meta.description'?{siteName:site.siteName}:{});
 return {title:kind==='catalog'?site.siteName+' Store':text(keys[kind][0])+' | '+site.siteName,description:text(keys[kind][1])};
}
