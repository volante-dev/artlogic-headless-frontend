import {test,expect} from 'vitest';
import {checkoutPaymentMatches} from '../../lib/commerce/payment';
test('compares integer SDK cents and displays formatted amounts without parsing them',()=>{
 const session={currency:'eur',total:{total:{minorUnitsAmount:5300,amount:'53,00 €'}}};
 expect(checkoutPaymentMatches(session,5300)).toBe(true);
 expect(checkoutPaymentMatches({...session,total:{total:{minorUnitsAmount:5301,amount:'53,00 €'}}},5300)).toBe(false);
 expect(checkoutPaymentMatches({...session,currency:'usd'},5300)).toBe(false);
});
