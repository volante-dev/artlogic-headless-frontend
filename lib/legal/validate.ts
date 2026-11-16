import {Ajv2020} from "ajv/dist/2020.js";
import {legalPageSchema} from "./schema.generated";
import {safeEditorialHref} from "../editorial/links";
import type {components} from "../api/generated";
const validate=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false}).compile(legalPageSchema);
export type LegalPage=components["schemas"]["SiteLegalPageResolved"];
export function parseLegalPage(value:unknown):LegalPage|null{
 if(value==null)return null;
 const stack=[{value,depth:0}];let count=0;
 while(stack.length){const item=stack.pop()!;if(++count>150000||item.depth>64)throw Error("invalid_legal_page");if(!item.value||typeof item.value!=="object")continue;
  const node=item.value as Record<string,unknown>;
  if(node.type==="link"){const href=(node.attrs as {href?:unknown}|undefined)?.href;if(typeof href!=="string"||!safeEditorialHref(href))throw Error("invalid_legal_page");}
  for(const child of Object.values(node))if(child&&typeof child==="object")stack.push({value:child,depth:item.depth+1});
 }
 if(JSON.stringify(value).length>524288||!validate(value))throw Error("invalid_legal_page");
 return value as LegalPage;
}
