'use client';
export function PrintLegalDocument({locale}:{locale:string}){return <button type="button" onClick={()=>window.print()}>{locale.startsWith('en')?'Print or save a copy':'Imprimer ou conserver une copie'}</button>;}
