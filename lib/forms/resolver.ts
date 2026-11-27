import {runtimeText} from "../i18n/site-messages";
import {formIssueMessageKey} from "./issue-message-keys.generated";
import type {Resolver,FieldErrors} from "react-hook-form";
import type {FormDocument,FormIssue,ExpertiseObject} from "./model.generated";
import {validateExpertiseObjects} from "./expertise.generated";
import {validateFormAnswers} from "./validation.generated";
export interface FormRuntimeValues{objects?:ExpertiseObject[];answers:Record<string,string|number|boolean|string[]>}
export function formAnswerIssuePath(issue:FormIssue,objects:readonly {id:string}[]=[]){
 if(issue.fieldId)return "answers."+issue.fieldId;
 if(issue.objectId){const index=objects.findIndex(object=>object.id===issue.objectId);if(index<0)return "root.form";const suffix=issue.path.replace(/^objects\.[^.]+\.?/,"");return "objects."+index+(suffix?"."+suffix:"");}
 return issue.path.startsWith("answers.")?issue.path:"root.form";
}
export function formAnswerIssueMessage(issue:FormIssue,locale:string,messages:Readonly<Record<string,string|undefined>>){return runtimeText(messages,locale,formIssueMessageKey(issue));}
export function formAnswersResolver(document:FormDocument,locale:string,messages:Readonly<Record<string,string|undefined>>):Resolver<FormRuntimeValues>{return async values=>{
 const issues=[...validateFormAnswers(document,values.answers),...(document.kind==="expertise"?validateExpertiseObjects(values.objects):[])],errors:FieldErrors<FormRuntimeValues>={};
 for(const issue of issues){const field=issue.fieldId??issue.path.match(/^answers\.([^.]+)/)?.[1];if(field){errors.answers??={};errors.answers[field]={type:issue.code,message:formAnswerIssueMessage(issue,locale,messages)};}else if(issue.objectId){const path=formAnswerIssuePath(issue,values.objects??[]).split(".");let target=errors as Record<string,unknown>;for(let index=0;index<path.length-1;index++){const part=path[index]!;target[part]??=/^\d+$/.test(path[index+1]!)?[]:{};target=target[part] as Record<string,unknown>;}target[path.at(-1)!]={type:issue.code,message:formAnswerIssueMessage(issue,locale,messages)};}else errors.root={form:{type:issue.code,message:formAnswerIssueMessage(issue,locale,messages)}};}
 // Keep local hidden values in RHF; only the outbound projection removes them.
 return issues.length?{values:{},errors}:{values,errors:{}};
};}
