export type EditorialQuery={q?:string;termIds?:string[];page:number;pageSize:number;catalogRevision?:string};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function parseEditorialQuery(query:URLSearchParams):EditorialQuery{
 for(const key of query.keys())if(!["q","termIds","page","pageSize","catalogRevision"].includes(key)||key!=="termIds"&&query.getAll(key).length!==1)throw new Error("invalid_request");
 const integer=(key:string,fallback:number,max:number)=>{const raw=query.get(key);if(raw===null)return fallback;const value=Number(raw);if(!/^[1-9][0-9]*$/.test(raw)||!Number.isSafeInteger(value)||value>max)throw new Error("invalid_request");return value;};
 const q=query.get("q")?.trim().normalize("NFC"),termIds=query.getAll("termIds").map(id=>id.toLowerCase()),catalogRevision=query.get("catalogRevision")??undefined;
 if(q&&Array.from(q).length>160||termIds.length>20||new Set(termIds).size!==termIds.length||termIds.some(id=>!uuid.test(id))||catalogRevision&&!/^[1-9][0-9]{0,29}$/.test(catalogRevision))throw new Error("invalid_request");
 return {q:q||undefined,termIds:termIds.length?termIds:undefined,page:integer("page",1,1000000),pageSize:integer("pageSize",24,48),catalogRevision};
}
export function editorialQueryString(query:Partial<EditorialQuery>){const params=new URLSearchParams();if(query.q)params.set("q",query.q);for(const id of query.termIds??[])params.append("termIds",id);if(query.page&&query.page!==1)params.set("page",String(query.page));if(query.pageSize&&query.pageSize!==24)params.set("pageSize",String(query.pageSize));if(query.catalogRevision)params.set("catalogRevision",query.catalogRevision);return params.toString();}
export function editorialSearchParams(params:Record<string,string|string[]|undefined>){const query=new URLSearchParams();for(const [key,value]of Object.entries(params))if(value!==undefined)for(const item of Array.isArray(value)?value:[value])query.append(key,item);return query;}
export function preservedEditorialQuery(query:URLSearchParams){try{const value=editorialQueryString(parseEditorialQuery(query));return value?"?"+value:"";}catch{return "";}}
