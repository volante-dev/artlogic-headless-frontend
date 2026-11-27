import {archivedRuntimeMessageCatalogues} from '../../lib/i18n/message-archives.generated';
import {decodeLocaleMessages} from '../../lib/i18n/decode-locale-messages';
import {describe,it,expect} from 'vitest';
import {decodeRuntimeMessages} from '../../lib/i18n/runtime-content';
import {runtimeMessageDefinitions} from '../../lib/i18n/message-definitions.generated';
const core=()=>Object.fromEntries(runtimeMessageDefinitions.filter(message=>message.module==='core').map(message=>[message.id,'Testo sintetico'+Object.keys(message.parameters).map(parameter=>' {'+parameter+'}').join('')]));
describe('US2 runtime message module admission',()=>{
 it('admits only complete optional modules without changing a valid requested core locale',()=>{
  const messages=core(),store=runtimeMessageDefinitions.find(message=>message.module==='store')!;messages[store.id]='Articolo';const result=decodeRuntimeMessages(messages,'it');expect(result.modules).toEqual(['core']);expect(result.messages[store.id]).toBeUndefined();expect(result.messages['nav.news']).toBe('Testo sintetico');
 });
 it('never invents a main-language fallback or accepts unknown keys, empty core values or executable templates',()=>{
  expect(()=>decodeRuntimeMessages({},'it')).toThrow('language_content_unavailable');for(const overrides of [{'nav.news':''},{'nav.news':'<img src=x>'},{unknown:'Unknown'}])expect(()=>decodeRuntimeMessages({...core(),...overrides},'it')).toThrow('language_content_unavailable');
 });
 it('drops a partial module with an invalid named parameter while retaining the core',()=>{
  const messages=core(),definition=runtimeMessageDefinitions.find(message=>message.module==='team'&&Object.keys(message.parameters).length)!;messages[definition.id]='Testo {unknown}';const result=decodeRuntimeMessages(messages,'it');expect(result.modules).toEqual(['core']);expect(result.messages[definition.id]).toBeUndefined();
 });
});

describe('US5 exact archived locale payloads',()=>{
 it('accepts the registered common core without fabricating its additive preferences or Store module',()=>{
  const archive=archivedRuntimeMessageCatalogues[0]!,messages=Object.fromEntries(archive.definitions.filter(definition=>definition.module==='core').map(definition=>[definition.id,'Contributo '+definition.id+Object.keys(definition.parameters).map(key=>' {'+key+'}').join('')])),runtime={catalogueId:archive.id,publicRevision:'3',contentRevision:'4',modules:['core']},decoded=decodeLocaleMessages(messages,runtime,'it');expect(decoded.runtime).toEqual(runtime);expect(decoded.messages['nav.news']).toBe('Contributo nav.news');expect(decoded.messages['privacyPolicy.necessaryLabel']).toBeUndefined();expect(decoded.messages['commerce.cart']).toBeUndefined();expect(()=>decodeLocaleMessages(messages,{...runtime,catalogueId:'unregistered'},'it')).toThrow();expect(()=>decodeLocaleMessages(messages,{...runtime,modules:['core','store']},'it')).toThrow();
 });
});
