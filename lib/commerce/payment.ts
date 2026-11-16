import type {components} from './contract-types.generated';
export function checkoutPaymentMatches(session:{currency:string;total:{total:{minorUnitsAmount:number;amount:string}}},expected:number){
 return session.currency.toUpperCase()==='EUR'&&Number.isSafeInteger(session.total.total.minorUnitsAmount)&&session.total.total.minorUnitsAmount===expected&&typeof session.total.total.amount==='string'&&session.total.total.amount.length>0;
}
export function stripeContact(a:components['schemas']['CommerceAddress']){return {name:a.fullName,address:{country:a.country,line1:a.line1,...(a.line2?{line2:a.line2}:{}),city:a.locality,...(a.region?{state:a.region}:{}),...(a.postalCode?{postal_code:a.postalCode}:{})}};}
