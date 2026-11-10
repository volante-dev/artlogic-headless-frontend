import {expect,it} from 'vitest';
import {articleMetaDescription} from '../../lib/editorial/metadata';
import {renderNativeEditorialArticle} from '../../lib/editorial/native-reader';
import type {PublicArticle} from '../../lib/editorial/types';
const article={id:'test',kind:'publication',title:'Catalogue',summary:null,blocks:[],authors:[],terms:[],relatedArticles:[],alternatePaths:{},cover:null,canonicalPath:'/publications/catalogue',editorialDate:"2026-11-10",publicRevision:'1',commonRevision:'1'} satisfies PublicArticle;
it('prefers the authored summary and uses the public body before the site fallback',()=>{
 const body:PublicArticle={...article,blocks:[{id:'body',type:'text',variant:'default',text:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Une '},{type:'text',text:'publication',marks:[{type:'italic'}]},{type:'text',text:' à découvrir.'}]}]}}]};
 expect(articleMetaDescription({...body,summary:' Résumé\n éditorial '},'Site')).toBe('Résumé éditorial');
 expect(articleMetaDescription(body,'Site')).toBe('Une publication à découvrir.');
 expect(articleMetaDescription(article,' Description du site ','Galerie')).toBe('Description du site');
 expect(articleMetaDescription(article,'','Galerie')).toBe('Catalogue — Galerie');
});
it('bounds generated body excerpts and preserves Unicode',()=>{
 const value=articleMetaDescription({...article,blocks:[{id:'body',type:'text',variant:'default',text:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Œuvres et regards. '.repeat(30)}]}]}}]});
 expect(Array.from(value).length).toBeLessThanOrEqual(160);expect(value.endsWith('…')).toBe(true);
});
it('includes an escaped description in the native document head',()=>{
 const html=renderNativeEditorialArticle({...article,summary:'Un "regard" <singulier>'},'fr');
 expect(html.slice(0,html.indexOf('</head>'))).toContain('<meta name="description" content="Un &quot;regard&quot; &lt;singulier&gt;">');
});
