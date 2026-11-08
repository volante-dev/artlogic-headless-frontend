import {describe,it,expect} from "vitest";
import {createFormTemplate} from "../../lib/forms/templates.generated";
import {formAnswersResolver,formAnswerIssuePath} from "../../lib/forms/resolver";
import {projectFormAnswers} from "../../lib/forms/projection";
const a="90000000-0000-4000-8000-000000000001",b="90000000-0000-4000-8000-000000000002";
function document(){const doc=createFormTemplate("blank",["fr","en"]),stepId=doc.steps[0]!.id;doc.fields=[{id:a,type:"checkbox",stepId,rowId:"a",column:1,required:false,constraints:{},translations:{fr:{label:"Autre"},en:{label:"Other"}}},{id:b,type:"shortText",stepId,rowId:"b",column:1,required:true,constraints:{},translations:{fr:{label:"Détail"},en:{label:"Detail"}},condition:{fieldId:a,operator:"checked",value:true}}];return doc;}
describe("public shared form rules",()=>{
 it("does not require or submit hidden values, while leaving the local values untouched",async()=>{const doc=document(),values={answers:{[a]:false,[b]:"local value"}},result=await formAnswersResolver(doc,"fr")(values,undefined,{} as never);expect(result.errors).toEqual({});expect(values.answers[b]).toBe("local value");expect(projectFormAnswers(doc,values.answers)).toEqual({[a]:false});});
 it("maps field UUID errors to nested RHF paths and translates messages without changing keys",async()=>{const doc=document(),values={answers:{[a]:true,[b]:""}},fr=await formAnswersResolver(doc,"fr")(values,undefined,{} as never),en=await formAnswersResolver(doc,"en")(values,undefined,{} as never);expect(fr.errors.answers?.[b]?.type).toBe("required");expect(fr.errors.answers?.[b]?.message).not.toBe(en.errors.answers?.[b]?.message);});
 it("maps stable object identities after a reorder instead of confusing them with RHF row keys",()=>{const issue={path:"objects."+a+".designation",objectId:a,code:"required"};expect(formAnswerIssuePath(issue,[{id:b},{id:a}])).toBe("objects.1.designation");expect(formAnswerIssuePath(issue,[{id:a},{id:b}])).toBe("objects.0.designation");expect(formAnswerIssuePath(issue,[])).toBe("root.form");});
});
