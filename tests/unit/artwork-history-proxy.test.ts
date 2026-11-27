import {beforeEach,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
vi.mock('server-only',()=>({}));
vi.mock('../../lib/i18n/runtime-policy',async()=>{const {managedLanguageRead}=await import('../fixtures/language-policy');return {readRuntimeLanguagePolicy:async()=>managedLanguageRead()};});
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({}),configuredLocalePolicy:()=>({defaultLocale:'fr',locales:[{code:'fr'},{code:'en'}]})}));
const api=vi.hoisted(()=>({resolve:vi.fn()}));
vi.mock('../../lib/artworks/server',()=>({resolveArtworkAddress:api.resolve}));
import {proxy} from '../../proxy';
import {PublicApiError} from '../../lib/api/client';
beforeEach(()=>api.resolve.mockReset());
it('keeps campaign queries on historical artwork fallbacks before address activation',async()=>{
 api.resolve.mockResolvedValue(null);
 for(const path of ['/statuaires','/masquescollection/masque-ubi']){const response=await proxy(new NextRequest('https://site.example'+path+'?utm_source=archive'));expect(response.status).toBe(301);expect(response.headers.get('location')).toBe('https://site.example/artworks?utm_source=archive');}
});
it('prefers attested identity and never hides an API outage behind a generic redirect',async()=>{
 api.resolve.mockResolvedValueOnce({address:{canonicalPath:'/artworks/masque-atteste'},redirectStatus:308});
 const response=await proxy(new NextRequest('https://site.example/masquescollection/masque-ubi'));expect(response.status).toBe(308);expect(response.headers.get('location')).toBe('https://site.example/artworks/masque-atteste');
 api.resolve.mockRejectedValueOnce(new PublicApiError(503,'service_unavailable'));
 const failed=await proxy(new NextRequest('https://site.example/masquescollection/masque-ubi'));expect(failed.status).toBe(503);expect(failed.headers.get('location')).toBeNull();
});
