import {initialMessages,legacyRuntimeMessages,type SiteMessages} from '../../lib/i18n/site-messages';
import {describe,it,expect} from 'vitest';
import {linkInBioPublished,readLinkInBioCapability} from '../../lib/link-in-bio/capabilities';
import {linkInBioMessages} from '../../lib/link-in-bio/messages';
const supported={schemaVersion:1 as const,supported:true as const,enabled:true,published:true,routeClaimed:true,locales:['fr','en']};
describe('Optional public Link in bio capability',()=>{
 it('opens only a claimed published locale with the independent frontend flag',()=>{expect(linkInBioPublished(true,supported,'fr')).toBe(true);for(const cap of [null,{...supported,enabled:false},{...supported,published:false},{...supported,routeClaimed:false}])expect(linkInBioPublished(true,cap,'fr')).toBe(false);expect(linkInBioPublished(false,supported,'fr')).toBe(false);expect(linkInBioPublished(true,supported,'de')).toBe(false);});
 it('accepts only the capability 404 as a previous API and preserves other statuses',async()=>{expect(await readLinkInBioCapability(new Response('legacy HTML',{status:404}))).toBeNull();for(const status of [401,403,429,503])await expect(readLinkInBioCapability(Response.json({error:{code:'dependency_unavailable',message:'Unavailable',requestId:'synthetic',details:[]}},{status}))).rejects.toMatchObject({status});await expect(readLinkInBioCapability(Response.json({...supported,schemaVersion:2}))).rejects.toMatchObject({status:503});});
 it('uses supplied authored copy for each locale and never invents an English fallback',()=>{const fr=legacyRuntimeMessages(initialMessages('fr'),'fr'),en=legacyRuntimeMessages(initialMessages('en'),'en');expect(linkInBioMessages('fr-CA',fr).more).toBe('Afficher plus');expect(linkInBioMessages('en-GB',en).more).toBe('Show more');expect(()=>linkInBioMessages('de',{} as SiteMessages)).toThrow('language_content_unavailable');});
});
