export function teamInsertionIndex(sections:readonly {id:string}[],placement:{afterSectionId:string|null}){
 if(placement.afterSectionId===null)return 0;const anchor=sections.findIndex(s=>s.id===placement.afterSectionId);return anchor===-1?sections.length:anchor+1;
}
