import {describe,expect,it} from 'vitest';
import {parseStoredCart,changeCartQuantity,cartCount,consumePaidCart,parseCartConfirmations,CART_TTL_MS,CartValidationSequence} from '../../lib/commerce/cart';
const id='32000000-0000-4000-8000-000000000001';
describe('Private-free local cart',()=>{
 it('accepts only bounded identifiers, quantities and expiry and rejects personal data',()=>{
  const now=100000,cart={version:1,items:[{productId:id,quantity:2}],expiresAt:now+CART_TTL_MS};
  expect(parseStoredCart(JSON.stringify(cart),now)?.items).toHaveLength(1);
  expect(parseStoredCart(JSON.stringify({...cart,email:'synthetic@example.test'}),now)).toBeNull();
  expect(parseStoredCart(JSON.stringify({...cart,items:[{productId:id,quantity:1,price:1}]}),now)).toBeNull();
  expect(parseStoredCart(JSON.stringify(cart),cart.expiresAt)).toBeNull();
  expect(cartCount(changeCartQuantity(cart.items,id,3))).toBe(3);expect(changeCartQuantity(cart.items,id,0)).toEqual([]);
 });
 it('ignores older validations and refuses duplicate or excessive lines',()=>{
  const seq=new CartValidationSequence(),old=seq.next(),current=seq.next();expect(seq.current(old)).toBe(false);expect(seq.current(current)).toBe(true);seq.invalidate();expect(seq.current(current)).toBe(false);
  const now=1000;expect(parseStoredCart(JSON.stringify({version:1,expiresAt:now+1000,items:[{productId:id,quantity:1},{productId:id,quantity:1}]}),now)).toBeNull();
  expect(()=>changeCartQuantity([],id,100)).toThrow('validation_failed');
 });
});
it('removes only paid units and bounds anonymous confirmation metadata',()=>{
 const later='32000000-0000-4000-8000-000000000002',now=100000;
 expect(consumePaidCart([{productId:id,quantity:3},{productId:later,quantity:1}],[{productId:id,quantity:2}])).toEqual([{productId:id,quantity:1},{productId:later,quantity:1}]);
 expect(parseCartConfirmations(JSON.stringify([{attemptId:id,expiresAt:now+CART_TTL_MS}]),now)).toHaveLength(1);
 expect(parseCartConfirmations(JSON.stringify([{attemptId:id,email:'private@example.test',expiresAt:now+CART_TTL_MS}]),now)).toEqual([]);
 expect(parseCartConfirmations(JSON.stringify([{attemptId:id,expiresAt:now-1}]),now)).toEqual([]);
});
