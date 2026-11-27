'use client';
export function PrintLegalDocument({label}:{label:string}){return <button type="button" onClick={()=>window.print()}>{label}</button>;}
