import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect} from 'vitest';
import {ClientComponentsProvider} from '../../clients/ClientComponentsProvider';
import {SiteContentProvider} from '../../components/SiteContentProvider';
import {CartProvider} from '../../components/commerce/CartProvider';
import {StoreSubheader} from '../../components/commerce/StoreSubheader';
import {initialMessages} from '../../lib/i18n/messages.generated';

it('renders the same Store boundary for both registered profiles and both locales',()=>{
 for(const profileId of ['default','demo-gallery'])for(const locale of ['fr','en']){
  const subheader=createElement(StoreSubheader,{siteName:'Collection'});
  // eslint-disable-next-line react/no-children-prop
  const cart=createElement(CartProvider,{siteId:'32000000-0000-4000-8000-000000000001',initialProducts:[],checkoutReady:true,children:subheader});
  // eslint-disable-next-line react/no-children-prop
  const site=createElement(SiteContentProvider,{messages:initialMessages(locale),locale,defaultLocale:'fr',children:cart});
  // eslint-disable-next-line react/no-children-prop
  const html=renderToStaticMarkup(createElement(ClientComponentsProvider,{profileId,children:site}));
  expect(html).toContain('Collection');expect(html).toContain('Store');expect(html).toContain(initialMessages(locale)['commerce.orderTracking']);expect(html).toContain('aria-haspopup="dialog"');expect(html).not.toContain('stripe.com');
 }
});
