import {describe,expect,it} from 'vitest';
import {classifyRoute,isTechnicalPath,preservedQuery,localizedPath} from '../../lib/i18n/routes';
const policy={defaultLocale:'fr',locales:[{code:'fr',label:'Français'},{code:'en',label:'English'}]};
describe('Store routing boundaries',()=>{
 it('classifies only the configured Store paths without treating them as editorial slugs',()=>{
  expect(classifyRoute('/store',policy)).toMatchObject({kind:'store',locale:'fr',section:null});
  expect(classifyRoute('/en/store/checkout',policy)).toMatchObject({kind:'store',locale:'en'});
  expect(classifyRoute('/store/not-an-operation',policy).kind).toBe('unknown');expect(localizedPath('/store','fr','fr')).toBe('/store');
 });
 it('recognizes only allowlisted BFF paths and strips private lookup data from navigation keys',()=>{
  expect(isTechnicalPath('/api/store/cart/validate')).toBe(true);expect(isTechnicalPath('/api/store/anything')).toBe(false);
  expect(preservedQuery(classifyRoute('/store/order-tracking',policy),new URLSearchParams('email=synthetic@example.test&orderNumber=private'))).toBe('');
  const id='32000000-0000-4000-8000-000000000001';expect(preservedQuery(classifyRoute('/store/confirmation',policy),new URLSearchParams('attempt='+id+'&client_secret=private'))).toBe('?attempt='+id);
 });
});
