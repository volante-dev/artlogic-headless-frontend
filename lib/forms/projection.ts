import type {FormDocument,FormAnswer} from "./model.generated";
import {effectiveFormAnswers} from "./effective-answers.generated";
export function projectFormAnswers(document:FormDocument,answers:Readonly<Record<string,FormAnswer>>){return effectiveFormAnswers(document,answers);}
