import {it,expect,vi,beforeEach,afterEach} from 'vitest';
const state=vi.hoisted(()=>({config:{DATA_MODE:'real',DEPLOYMENT_ENV:'test',CONTACT_INGRESS_KEY:'synthetic-ingress-key',CONTACT_TRUSTED_INGRESS_HEADER:'x-gallery-visitor'} as Record<string,string>}));
vi.mock('server-only',()=>({}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>state.config,stringValue:(c:Record<string,string>,k:string)=>c[k],isLoopback:(host:string)=>host==='127.0.0.1'}));
import {visitorIp} from '../../lib/contact/network-context';
it('accepts only the dedicated overwritten IP header after proving ingress, even when new contact is disabled',()=>{state.config.CONTACT_ENABLED='false';for(const headers of [{},{'x-forwarded-for':'1.2.3.4','x-real-ip':'1.2.3.4'},{'x-contact-ingress-key':'forged','x-gallery-visitor':'1.2.3.4'},{'x-contact-ingress-key':'synthetic-ingress-key','x-gallery-visitor':'1.2.3.4, 5.6.7.8'}])expect(()=>visitorIp(new Request('https://gallery.example.test/api/contact/receipt',{headers:headers as Record<string,string>}))).toThrow();expect(visitorIp(new Request('https://gallery.example.test/api/contact/receipt',{headers:{'x-contact-ingress-key':'synthetic-ingress-key','x-gallery-visitor':'192.0.2.10','x-forwarded-for':'203.0.113.99'}}))).toBe('192.0.2.10');});

beforeEach(()=>vi.stubEnv("VERCEL",""));
afterEach(()=>vi.unstubAllEnvs());
it.each(["192.0.2.10","2001:db8::1"])("uses only Vercel's overwritten singleton address on managed hosting: %s",ip=>{vi.stubEnv("VERCEL","1");expect(visitorIp(new Request('https://gallery.example.test/api/forms/example',{headers:{'x-vercel-forwarded-for':ip,'x-forwarded-for':'203.0.113.99','x-real-ip':'203.0.113.99','x-gallery-visitor':'203.0.113.99'}}))).toBe(ip);});
it.each(['','not-an-ip','192.0.2.10, 203.0.113.99'])("fails closed on invalid or missing platform provenance: %s",ip=>{vi.stubEnv("VERCEL","1");expect(()=>visitorIp(new Request('https://gallery.example.test/api/forms/example',{headers:{'x-vercel-forwarded-for':ip,'x-forwarded-for':'192.0.2.10','x-contact-ingress-key':'synthetic-ingress-key','x-gallery-visitor':'192.0.2.10'}}))).toThrow();});
it("does not infer a trusted runtime from forged Vercel request headers",()=>{expect(()=>visitorIp(new Request('https://gallery.example.test/api/forms/example',{headers:{'x-vercel-forwarded-for':'192.0.2.10','x-vercel-id':'dub1::forged'}}))).toThrow();});
