import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {CartProvider} from './CartProvider';
import {Checkout} from './Checkout';
import {deliveryStoryData as data} from './delivery-fixtures.story';
import type {components} from '../../lib/commerce/contract-types.generated';
import type {StoreProduct} from '../../lib/commerce/catalog';
function DeliveryCheckoutStory(){return <CartProvider siteId={data.siteId} initialProducts={data.products as StoreProduct[]} checkoutReady><main style={{padding:24}}><Checkout options={data.options as components['schemas']['CommerceCheckoutOptions']} termsHref='/terms'/></main></CartProvider>;}
const meta={title:'Store/Delivery checkout',component:DeliveryCheckoutStory,parameters:{layout:'fullscreen'}} satisfies Meta<typeof DeliveryCheckoutStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
