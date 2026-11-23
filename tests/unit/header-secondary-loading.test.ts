import {beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({store:vi.fn(),navigation:vi.fn(),site:vi.fn(),presentation:vi.fn(),config:{COMMERCE_ENABLED:'true',COMMERCE_SERVICE_KEY:'test'}}));
vi.mock('server-only',()=>({}));
vi.mock('next/headers',()=>({headers:async()=>new Headers({'x-site-path':'/exhibitions','x-site-section':'exhibitions'})}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>mocks.config}));
vi.mock('../../lib/commerce/catalog',()=>({loadStoreCapabilities:mocks.store}));
vi.mock('../../lib/navigation/load-public',()=>({loadPublicNavigation:mocks.navigation}));
vi.mock('../../lib/i18n/load-site-content',()=>({loadSiteContent:mocks.site}));
vi.mock('../../lib/presentation/load-public',()=>({loadPublicPresentation:mocks.presentation}));
vi.mock('../../lib/editorial/load-article',()=>({loadPublicArticle:vi.fn()}));
import {loadHeaderRouteContext} from '../../lib/header/load-route-context';
beforeEach(()=>{
 mocks.site.mockResolvedValue({locale:'fr',policy:{defaultLocale:'fr',locales:[{code:'fr',label:'Français'}]}});
 mocks.presentation.mockResolvedValue({pageKey:'exhibitions',releaseId:'release',sections:[]});
 mocks.navigation.mockResolvedValue({items:[]});mocks.config.COMMERCE_ENABLED='true';
});
it('commits a public route and starts navigation while Store capabilities are still pending',async()=>{
 let resolve!:(value:{enabled:boolean;trackingAvailable:boolean})=>void;
 mocks.store.mockReturnValue(new Promise(done=>{resolve=done;}));
 const snapshot=await loadHeaderRouteContext();
 expect(snapshot.status).toBe('ready');expect(snapshot.hrefKey).toBe('/exhibitions');
 expect(mocks.navigation).toHaveBeenCalledWith('fr','release');expect(snapshot.commerce).toBeDefined();
 resolve({enabled:true,trackingAvailable:false});
 await expect(snapshot.commerce).resolves.toEqual({storeAvailable:true,storeTrackingAvailable:true});
});
it('keeps public navigation available when the optional Store endpoint fails',async()=>{
 mocks.store.mockRejectedValue(new Error('unavailable'));
 const snapshot=await loadHeaderRouteContext();expect(snapshot.status).toBe('ready');
 await expect(snapshot.commerce).resolves.toEqual({storeAvailable:false,storeTrackingAvailable:false});
});
it('preserves tracking while frontend purchases remain disabled',async()=>{
 mocks.config.COMMERCE_ENABLED='false';mocks.store.mockResolvedValue({enabled:true,trackingAvailable:true});
 const snapshot=await loadHeaderRouteContext();
 await expect(snapshot.commerce).resolves.toEqual({storeAvailable:false,storeTrackingAvailable:true});
});
