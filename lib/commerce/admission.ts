/** The public frontend flag closes new purchases independently of the shared API. */
const availableWithoutSales=new Set(['commerceReadAttempt','commerceCancelAttempt','commerceReadOrderDocument','commerceLookupOrder','commerceDeliveryLookupOrder','commerceInternalDeliveryCapabilities','commerceSubmitWithdrawal','commerceRecordConsent']);
export function commerceOperationAllowed(enabled:boolean,operation:string,body:unknown){
 if(enabled)return true;
 if(operation==='commerceCreateGuestSession')return !!body&&typeof body==='object'&&'purpose' in body&&body.purpose==='withdrawal';
 return availableWithoutSales.has(operation);
}
