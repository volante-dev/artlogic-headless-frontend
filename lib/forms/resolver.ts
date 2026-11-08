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
export function formAnswerIssueMessage(issue:FormIssue,locale:string){const fr=locale.startsWith("fr");return issue.code==="required"?(fr?"Complétez ce champ.":"Complete this field."):issue.code==="invalid_email"?(fr?"Saisissez une adresse e-mail valide.":"Enter a valid email address."):(fr?"Vérifiez cette valeur.":"Check this value.");}
export function formAnswersResolver(document:FormDocument,locale:string):Resolver<FormRuntimeValues>{return async values=>{
 const issues=[...validateFormAnswers(document,values.answers),...(document.kind==="expertise"?validateExpertiseObjects(values.objects):[])],errors:FieldErrors<FormRuntimeValues>={};
 for(const issue of issues){const field=issue.fieldId??issue.path.match(/^answers\.([^.]+)/)?.[1];if(field){errors.answers??={};errors.answers[field]={type:issue.code,message:formAnswerIssueMessage(issue,locale)};}else if(issue.objectId){const path=formAnswerIssuePath(issue,values.objects??[]).split(".");let target=errors as Record<string,unknown>;for(let index=0;index<path.length-1;index++){const part=path[index]!;target[part]??=/^\d+$/.test(path[index+1]!)?[]:{};target=target[part] as Record<string,unknown>;}target[path.at(-1)!]={type:issue.code,message:formAnswerIssueMessage(issue,locale)};}else errors.root={form:{type:issue.code,message:formAnswerIssueMessage(issue,locale)}};}
 // Keep local hidden values in RHF; only the outbound projection removes them.
 return issues.length?{values:{},errors}:{values,errors:{}};
};}
