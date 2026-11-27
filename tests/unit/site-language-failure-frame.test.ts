import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {LanguageFailure,LanguageFailureProvider} from '../../components/LanguageFailure';
describe('US3 cold failure without admitted interface copy',()=>{
 it('keeps the requested locale and a relative main-language link without inventing French business text',()=>{
  const html=renderToStaticMarkup(createElement(LanguageFailureProvider,{locale:'it',defaultLocale:'fr'},createElement(LanguageFailure)));expect(html).toContain('lang="it"');expect(html).toContain('503');expect(html).toContain('href="/"');expect(html).toContain('hrefLang="fr"');expect(html).toContain('francese');expect(html).not.toContain('Réessayer');expect(html).not.toContain('indisponible');
 });
 it('uses the actual immutable main language rather than assuming French',()=>{
  const html=renderToStaticMarkup(createElement(LanguageFailureProvider,{locale:'de',defaultLocale:'en'},createElement(LanguageFailure)));expect(html).toContain('lang="de"');expect(html).toContain('Englisch');expect(html).toContain('hrefLang="en"');
 });
});
