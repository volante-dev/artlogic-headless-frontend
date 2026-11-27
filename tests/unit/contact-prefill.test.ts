import {initialMessages,legacyRuntimeMessages} from "../../lib/i18n/site-messages";
import {describe,it,expect} from 'vitest';
import {createFormTemplate} from '../../lib/forms/templates.generated';
import {artworkInquiryCopy,prefillContactAnswers,formContactIdentity,readContactIdentity,saveContactIdentity} from '../../lib/forms/contact-prefill';
const artwork={title:'Figure de reliquaire',artist:'Gabon'},identity={firstName:'Camille',lastName:'Martin',name:'Camille Martin',email:'camille@example.test'};
describe('artwork inquiry defaults and tab-scoped identity',()=>{
 it('prepares the actual Contact fields in French and English, retaining any user answers',()=>{
  const doc=createFormTemplate('contact',['fr','en']),[name,email,subject,message]=doc.fields;
  const result=prefillContactAnswers(doc,{},identity,artwork,'fr','Demande d’informations',legacyRuntimeMessages(initialMessages('fr'),'fr'));
  expect(result[name!.id]).toBe('Camille Martin');expect(result[email!.id]).toBe(identity.email);expect(result[subject!.id]).toContain(artwork.title);expect(result[message!.id]).toContain('Bonjour');expect(result[message!.id]).toContain('Gabon');
  const edited=prefillContactAnswers(doc,{[subject!.id]:'Mon sujet',[message!.id]:'Mon texte'},identity,artwork,'en','Artwork inquiry',legacyRuntimeMessages(initialMessages('en'),'en'));expect(edited[subject!.id]).toBe('Mon sujet');expect(edited[message!.id]).toBe('Mon texte');
  expect(artworkInquiryCopy(artwork,'en','Artwork inquiry',legacyRuntimeMessages(initialMessages('en'),'en')).message).toContain('Hello');expect(prefillContactAnswers(doc,{},null,null,'fr','Sujet',legacyRuntimeMessages(initialMessages('fr'),'fr'))).toEqual({});
 });
 it('recognises separate first and family name fields without guessing unrelated fields',()=>{
  const doc=createFormTemplate('contact',['fr','en']),name=doc.fields[0]!;name.translations={fr:{label:'Nom'},en:{label:'Last name'}};doc.fields.push({...name,id:crypto.randomUUID(),rowId:'prenom',translations:{fr:{label:'Prénom'},en:{label:'First name'}}});
  const result=prefillContactAnswers(doc,{},identity,null,'fr','Sujet',legacyRuntimeMessages(initialMessages('fr'),'fr'));expect(result[name.id]).toBe('Martin');expect(result[doc.fields.at(-1)!.id]).toBe('Camille');expect(formContactIdentity(doc,result)).toEqual(identity);
  name.translations={fr:{label:'Autre information'},en:{label:'Other information'}};expect(prefillContactAnswers(doc,{},identity,null,'fr','Sujet',legacyRuntimeMessages(initialMessages('fr'),'fr'))).not.toHaveProperty(name.id);
 });
 it('does not fill hidden, ambiguous or unrecognised fields and respects authored limits',()=>{
  const doc=createFormTemplate('contact',['fr']),subject=doc.fields[2]!;subject.constraints.maxLength=12;
  expect(String(prefillContactAnswers(doc,{},null,artwork,'fr','Demande',legacyRuntimeMessages(initialMessages('fr'),'fr'))[subject.id]).length).toBe(12);
  const checkbox={...doc.fields[0]!,id:crypto.randomUUID(),type:'checkbox' as const};doc.fields.push(checkbox);subject.condition={fieldId:checkbox.id,operator:'checked'};expect(prefillContactAnswers(doc,{},null,artwork,'fr','Demande',legacyRuntimeMessages(initialMessages('fr'),'fr'))).not.toHaveProperty(subject.id);
  const name=doc.fields[0]!;doc.fields.push({...name,id:crypto.randomUUID()});expect(prefillContactAnswers(doc,{},identity,null,'fr','Sujet',legacyRuntimeMessages(initialMessages('fr'),'fr'))).not.toHaveProperty(name.id);
 });
 it('stores only identity, never the message or proof, and tolerates unavailable storage',()=>{
  const data=new Map<string,string>(),storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};
  saveContactIdentity({...identity,...{message:'PRIVATE MESSAGE',proof:'PRIVATE PROOF'}},storage);expect(readContactIdentity(storage)).toEqual(identity);expect([...data.values()].join()).not.toContain('PRIVATE');
  const blocked={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};expect(readContactIdentity(blocked)).toBeNull();expect(()=>saveContactIdentity(identity,blocked)).not.toThrow();
  expect(readContactIdentity({getItem:()=>'{broken'})).toBeNull();expect(readContactIdentity({getItem:()=>JSON.stringify({email:'invalid',name:'Someone'})})).toBeNull();
 });
});
