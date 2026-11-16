'use client';
import type {components} from '../../lib/commerce/contract-types.generated';
import {useCart} from './CartProvider';
import styles from './Checkout.module.css';
export function CheckoutSummary({quote,locale}:{quote:components['schemas']['CommerceQuote']|null;locale:string}){
 const cart=useCart(),fr=locale==='fr',money=(n:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(n/100);
 const lines=quote?quote.lines.map(l=>({id:l.productId,title:l.title,quantity:l.quantity,gross:l.gross})):cart.items.map(i=>({id:i.productId,title:cart.products.get(i.productId)?.title??(fr?'Produit':'Product'),quantity:i.quantity,gross:(cart.products.get(i.productId)?.grossUnitAmount??0)*i.quantity}));
 return <aside className={styles.summary} aria-label={fr?'Récapitulatif de commande':'Order summary'}><h2>{fr?'Votre commande':'Your order'}</h2><ul className={styles.lines}>{lines.map(l=><li key={l.id}><span>{l.title}<small>{fr?'Quantité':'Quantity'} : {l.quantity}</small></span><span>{money(l.gross)}</span></li>)}</ul>
  <dl className={styles.amounts}><div><dt>{fr?'Produits':'Products'}</dt><dd>{money(quote?.amounts.itemsGross??cart.subtotal)}</dd></div><div><dt>{fr?'Livraison':'Delivery'}</dt><dd>{quote?money(quote.amounts.shippingGross):(fr?'Calculée à l’étape suivante':'Calculated at the next step')}</dd></div>{quote&&<><div className={styles.secondary}><dt>{fr?'Taxes incluses':'Included taxes'}</dt><dd>{money(quote.amounts.itemsTax+quote.amounts.shippingTax)}</dd></div><div className={styles.total}><dt>{fr?'Total TTC':'Total'}</dt><dd>{money(quote.amounts.totalGross)}</dd></div></>}</dl>
  {quote?.importDisclosure&&<p className={styles.secondary}>{quote.importDisclosure}</p>}
 </aside>;
}
