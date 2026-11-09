import {it,expect} from 'vitest';
import {warmImageViews,isImageView} from '../../lib/editorial/immersive/warm-views';
import {buildEditorialViews,viewImagePaths,type Article,type EditorialView} from '../../lib/editorial/immersive/build-views';
import {editorialBlocks,editorialVideo,eid} from '../../.storybook/editorial-fixtures';
const article:Article={id:eid(1),kind:'publication',canonicalPath:'/publications/demo',title:'Demo',summary:null,editorialDate:null,cover:null,authors:[],terms:[],alternatePaths:{},blocks:editorialBlocks(),relatedArticles:[],publicRevision:'1',commonRevision:'1'};
it('mounts only the next two image views, skipping text and never mounting a video ahead',()=>{
 const views=buildEditorialViews({...article,blocks:[{id:eid(2),type:'media',variant:'default',media:editorialVideo()},...article.blocks]},'mobile'),ids=warmImageViews(views,views[0]!.id);
 expect([...ids]).toEqual([views[3]!.id,views[4]!.id]);expect(ids.has(views[1]!.id)).toBe(false);expect(ids.size).toBe(2);
 const later=warmImageViews(views,views[4]!.id);expect([...later]).toEqual([views[5]!.id]);
});
it('excludes forms, related articles and text-only panels from eager mounting',()=>{
 expect(isImageView({id:'related',kind:'related',animationId:'text-fade'})).toBe(false);
 const split=buildEditorialViews(article,'mobile').find(v=>v.kind==='block'&&v.block.type==='textMedia')!;expect(isImageView({...split,panel:'text'} as EditorialView)).toBe(false);
 expect(isImageView({id:'form',kind:'block',animationId:'form-fade',block:{type:'formImage'}} as EditorialView)).toBe(false);
});

it('prepares the selected carousel slide when returning, rather than its first slide',()=>{
 const view=buildEditorialViews(article,'mobile').find(v=>v.kind==='block'&&v.block.type==='carousel')!;
 if(view.kind!=='block'||view.block.type!=='carousel')throw Error('fixture');const selected=view.block.slides[1]!;
 const source=selected.media.source;if(source?.kind!=='artwork'&&source?.kind!=='image')throw Error('fixture');expect(viewImagePaths(view,article,'mobile',selected.id)).toEqual([source.srcPath]);
});
