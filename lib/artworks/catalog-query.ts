import type {GallerySearch} from "./types";

export type CatalogParams=Record<string,string|string[]|undefined>;
export type CatalogQuery={kind:"numbered";query:GallerySearch}|{kind:"legacy";cursor:string};
const keys=new Set(["q","page","pageSize","catalogRevision","cursor","types"]);
function integer(value:string|undefined,min:number,max:number):number|undefined {
  if(value===undefined)return;
  const result=Number(value);
  if(!/^(?:0|[1-9][0-9]*)$/.test(value)||!Number.isSafeInteger(result)||result<min||result>max)throw new Error("invalid_catalog_query");
  return result;
}
/** One parser for public URLs, language links and the server-rendered catalogue. */
export function parseCatalogQuery(params:CatalogParams):CatalogQuery {
  for(const [key,value]of Object.entries(params))if(!keys.has(key)||Array.isArray(value)&&key!=="types")throw new Error("invalid_catalog_query");
  const rawTypes=Array.isArray(params.types)?params.types.join(","):params.types;
  const types=parseCatalogTypes(rawTypes);
  const scalar=params as Record<string,string|undefined>;
  if(scalar.cursor!==undefined){
    if(Object.keys(scalar).some(key=>key!=="cursor"&&scalar[key]!==undefined)||!scalar.cursor||scalar.cursor.length>2048)throw new Error("invalid_catalog_query");
    return {kind:"legacy",cursor:scalar.cursor};
  }
  const q=scalar.q?.normalize("NFC").trim();
  if(q!==undefined&&Array.from(q).length>160)throw new Error("invalid_catalog_query");
  return {kind:"numbered",query:{types:types.length?types:undefined,q:q||undefined,page:integer(scalar.page,1,1000000),pageSize:integer(scalar.pageSize,1,100),catalogRevision:integer(scalar.catalogRevision,0,Number.MAX_SAFE_INTEGER)}};
}
export function catalogQueryString(query:GallerySearch):string {
  const p=new URLSearchParams();
  for(const key of ["q","page","pageSize","catalogRevision"] as const)if(query[key]!==undefined&&query[key]!=="")p.set(key,String(query[key]));
  if(query.types?.length)p.set("types",[...new Set(query.types)].sort((a,b)=>a-b).join(","));
  return p.size?"?"+p.toString():"";
}
export function preservedCatalogQuery(params:URLSearchParams):string {
  const input:CatalogParams={};
  for(const key of params.keys())input[key]=params.getAll(key).length===1?params.get(key)!:params.getAll(key);
  try{const result=parseCatalogQuery(input);return result.kind==="legacy"?"?"+new URLSearchParams({cursor:result.cursor}):catalogQueryString(result.query);}catch{return "";}
}

export function parseCatalogTypes(raw:string|undefined):number[]{
 if(raw===undefined||raw==="")return [];if(raw.length>1700||!/^[1-9][0-9]*(,[1-9][0-9]*)*$/.test(raw))throw new Error("invalid_catalog_query");
 const ids=[...new Set(raw.split(",").map(Number))].sort((a,b)=>a-b);if(ids.length>100||ids.some(id=>!Number.isSafeInteger(id)))throw new Error("invalid_catalog_query");return ids;
}
