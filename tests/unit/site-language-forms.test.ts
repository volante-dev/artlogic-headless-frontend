import {createElement} from 'react';
import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {formAnswerIssueMessage} from '../../lib/forms/resolver';
import {artworkInquiryCopy} from '../../lib/forms/contact-prefill';
import {FormView} from '../../components/forms/FormView';
import {SiteContentProvider} from '../../components/SiteContentProvider';
import {initialMessages,legacyRuntimeMessages} from '../../lib/i18n/site-messages';
import {runtimeMessageCatalogueId} from '../../lib/i18n/message-definitions.generated';
const messages={...legacyRuntimeMessages(initialMessages('en'),'en'),'ui.b91303ffe4984870':'Campo obbligatorio.','ui.9ec3b23da5294ef5':'Indirizzo non valido.','ui.e9b23bab7910e993':'Controllare il valore.','ui.660d2ed8f57ddfb4':'Informazioni su {identity}','ui.ce02c14a3bfcd81d':'Richiesta ricevuta.','ui.8361d5bf83e8cf50':'Riferimento','ui.4af521a649a32cab':'Nuova richiesta'};
describe('US2 form text comes from the supplied runtime catalogue',()=>{
 it('uses contributed validation text, never an English fallback for another locale',()=>{
  expect(formAnswerIssueMessage({path:'answers.a',code:'required'},'it',messages)).toBe('Campo obbligatorio.');expect(formAnswerIssueMessage({path:'answers.a',code:'invalid_email'},'it',messages)).toBe('Indirizzo non valido.');expect(formAnswerIssueMessage({path:'answers.a',code:'out_of_range'},'it',messages)).toBe('Controllare il valore.');expect(()=>formAnswerIssueMessage({path:'answers.a',code:'required'},'it',{})).toThrow();
 });
 it('keeps entered artwork names as parameters in contributed inquiry text',()=>{
  expect(artworkInquiryCopy({title:'Figura',artist:'Gabon'},'it','Informazioni',messages)).toEqual({subject:'Informazioni : Figura',message:'Informazioni su Figura (Gabon)'});
 });
 it('renders the accepted form actions from the request catalogue in server HTML',()=>{
  const supplied=messages;
  const providerProps:Parameters<typeof SiteContentProvider>[0]={messages:supplied,locale:'it',defaultLocale:'fr',runtime:{catalogueId:runtimeMessageCatalogueId,publicRevision:'1',contentRevision:'1',modules:['core','forms']},children:createElement(FormView,{phase:'accepted',locale:'it',reference:'DEMO-1',onRestart(){},onSubmit(){},onRecover(){}})};
  const html=renderToStaticMarkup(createElement(SiteContentProvider,providerProps));
  expect(html).toContain('DEMO-1');expect(html).toContain('Richiesta ricevuta.');expect(html).toContain('Riferimento');expect(html).toContain('Nuova richiesta');expect(html).not.toContain('Your request');
 });
});
