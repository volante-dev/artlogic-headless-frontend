import {it,expect} from 'vitest';
import {renderNativeEditorialArticle} from '../../lib/editorial/native-reader';
import {editorialBlocks,eid} from '../../.storybook/editorial-fixtures';
import type {PublicArticle} from '../../lib/editorial/types';
const article:PublicArticle={id:eid(1),kind:'publication',canonicalPath:'/publications/demo',title:'<script>alert(1)</script>',summary:'An accessible article',editorialDate:'2026-11-01',cover:null,authors:[],terms:[],alternatePaths:{en:'/en/publications/demo'},blocks:editorialBlocks(),relatedArticles:[],publicRevision:'1',commonRevision:'1'};
it('serializes the authorized projection without scripts, executable links or hidden blocks',()=>{const html=renderNativeEditorialArticle(article,'fr');expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script');expect(html).not.toContain('<iframe');expect(html).toContain('La lumière comme matière');expect(html).toContain('?reader=native');expect(html).toContain('Étude de démonstration');expect(html).not.toContain('data-reader-state');});
it.each(['diptych','triptych'] as const)('reads every %s image and caption without inert controls',format=>{
 const base=editorialBlocks().find(b=>b.type==='media')!;if(base.type!=='media'||base.media.source?.kind!=='image')throw Error('image fixture missing');
 const count=format==='diptych'?2:3,items=Array.from({length:count},(_,index)=>({id:eid(100+index),media:{...base.media,source:{...base.media.source!,kind:'image' as const,assetId:eid(500)},video:null,alt:'Vue '+(index+1),subtext:{type:'doc' as const,content:[{type:'paragraph' as const,content:[{type:'text' as const,text:'Légende '+(index+1)}]}]}}}));
 const html=renderNativeEditorialArticle({...article,blocks:[{id:eid(99),type:'imageGroup',variant:'default',format,items}]} as PublicArticle,'fr');
 for(let index=1;index<=count;index++){expect(html).toContain('Vue '+index);expect(html).toContain('Légende '+index);}expect(html).not.toContain('<button');
});
