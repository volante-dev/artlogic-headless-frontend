import {test} from 'vitest';
import assert from 'node:assert/strict';
import {checkoutResolver,checkoutQuoteInput,type CheckoutValues} from '../../lib/commerce/checkout-resolver';
const options={destinations:['FR'],addressRules:{FR:{postalCodeRequired:true,regionRequired:false},HK:{postalCodeRequired:false,regionRequired:false}},phoneRequiredCountries:[]};
const address={fullName:'Synthetic Guest',line1:'11 rue Exemple',locality:'Paris',country:'FR',postalCode:'75006'};
const values:CheckoutValues={email:'Client@Example.test',shippingAddress:address,billingSameAsShipping:false,billingAddress:{...address,country:'HK',postalCode:''},acceptTerms:false};
test('checkout reuses the generated rules independently of Forms execution',async()=>{
 const resolver=checkoutResolver(options,'fr',2),args={fields:{},shouldUseNativeValidation:false};
 assert.deepEqual((await resolver(values,undefined,args)).errors,{});
 const invalid=await resolver({...values,shippingAddress:{...address,postalCode:''}},undefined,args);
 assert.equal(invalid.errors.shippingAddress?.postalCode?.type,'required');
 assert.equal(invalid.errors.billingAddress,undefined);
 const review=await checkoutResolver(options,'fr',3)(values,undefined,args);assert.equal(review.errors.acceptTerms?.type,'required');
});
test('identical billing never submits an old distinct address and email is normalized',()=>{
 const body=checkoutQuoteInput({...values,billingSameAsShipping:true},[{productId:'32000000-0000-4000-8000-000000000001',quantity:1}],'fr');
 assert.equal(body.email,'client@example.test');assert.equal(Object.hasOwn(body,'billingAddress'),false);
});
