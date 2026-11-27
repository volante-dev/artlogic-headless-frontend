import {describe,expect,it} from 'vitest';
import {initialMessages,legacyRuntimeMessages,runtimeText,hasRuntimeModule} from '../../lib/i18n/site-messages';
import {runtimeMessageInitialValues} from '../../lib/i18n/runtime-initials.generated';
import {runtimeMessageCatalogueId} from '../../lib/i18n/message-definitions.generated';
import {decodeLocaleMessages} from '../../lib/i18n/decode-locale-messages';
import {decodeRuntimeMessages} from '../../lib/i18n/runtime-content';
import {teamMessages} from '../../lib/presentation/team-messages';
import {sectionDescription} from '../../lib/seo/metadata';
describe('US2 exact public catalogue and legacy bridge',()=>{
 it('keeps authored legacy messages and admits only the complete supplied optional modules',()=>{
  const legacy=initialMessages('fr');legacy['nav.news']='Journal contribué';const bridge=legacyRuntimeMessages(legacy,'fr');expect(bridge['nav.news']).toBe('Journal contribué');expect(runtimeText(bridge,'fr','core.readWithoutJavaScript')).toBe('Lire cet article sans JavaScript');expect(hasRuntimeModule(bridge,'fr','store')).toBe(true);expect(Object.keys(bridge).some(key=>key.startsWith('notification.'))).toBe(false);expect(()=>legacyRuntimeMessages(legacy,'it')).toThrow('language_content_unavailable');
 });
 it('preserves int64 revisions and requires catalogue metadata to match the decoded modules',()=>{
  const messages=runtimeMessageInitialValues.fr,decoded=decodeRuntimeMessages(messages,'fr'),runtime={catalogueId:runtimeMessageCatalogueId,publicRevision:'9223372036854775807',contentRevision:'9007199254740993',modules:decoded.modules};
  expect(decodeLocaleMessages(messages,runtime,'fr').runtime?.contentRevision).toBe('9007199254740993');for(const overrides of [{catalogueId:'unknown'},{publicRevision:'9223372036854775808'},{modules:['core']},{modules:[...decoded.modules,'core']}])expect(()=>decodeLocaleMessages(messages,{...runtime,...overrides},'fr')).toThrow('language_content_unavailable');
  expect(()=>decodeLocaleMessages({...messages,'notification.forms.yes':'Yes'},runtime,'fr')).toThrow('language_content_unavailable');
 });
 it('formats contributed team accessibility and SEO text through named parameters without locale switches',()=>{
  const messages={...legacyRuntimeMessages(initialMessages('en'),'en'),'ui.0e95078bbc377004':'Scrivere a {name}','ui.83098ce596330d98':'Chiamare {name}','seo.section.home':'Visitare {siteName}'};
  expect(teamMessages('it',messages).email('A & B')).toBe('Scrivere a A & B');expect(teamMessages('it',messages).phone('A')).toBe('Chiamare A');expect(sectionDescription('home','it','Nome',messages)).toBe('Visitare Nome');
 });
});
