// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
export function canonicalAddressJson(value:unknown):string{
 if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonicalAddressJson).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalAddressJson((value as Record<string,unknown>)[k])).join(',')+'}';
 throw new Error('invalid_canonical_json');
}
