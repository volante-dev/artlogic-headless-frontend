import type {StripeElementLocale} from '@stripe/stripe-js';
/** Explicit provider capabilities, checked against the installed Stripe SDK on upgrade. */
const supported=['ar','bg','cs','da','de','el','en','en-AU','en-CA','en-NZ','en-GB','es','es-ES','es-419','et','fi','fil','fr','fr-CA','fr-FR','he','hu','hr','id','it','it-IT','ja','ko','lt','lv','ms','mt','nb','nl','no','pl','pt','pt-BR','ro','ru','sk','sl','sv','th','tr','vi','zh','zh-HK','zh-TW'] as const satisfies readonly StripeElementLocale[];
const sdkCoverage:Exclude<StripeElementLocale,typeof supported[number]|'auto'> extends never?true:never=true;
export function stripePaymentLocale(requested:string):{locale:StripeElementLocale;fallback:boolean}{
 void sdkCoverage;
 const exact=supported.find(value=>value.toLowerCase()===requested.toLowerCase());if(exact)return {locale:exact,fallback:false};
 let language='';try{language=new Intl.Locale(requested).language;}catch{/* Unknown input remains an explicit provider fallback. */}
 const base=supported.find(value=>value===language);return base?{locale:base,fallback:false}:{locale:'auto',fallback:true};
}
