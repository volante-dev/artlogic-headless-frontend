import {it,expect,vi,afterEach} from 'vitest';
import {createEditorialImagePrefetcher,editorialPrefetchPaths,prefetchEditorialImage} from '../../lib/editorial/immersive/image-prefetch';
import {buildEditorialViews,type Article} from '../../lib/editorial/immersive/build-views';
import {editorialBlocks,editorialImage,editorialVideo,eid} from '../../.storybook/editorial-fixtures';
import {physicalImageDescriptor} from '../../lib/media/public-image-descriptor';
afterEach(()=>vi.unstubAllGlobals());
const tick=()=>new Promise<void>(resolve=>queueMicrotask(()=>queueMicrotask(resolve)));
it('starts before navigation, keeps two transfers, reprioritizes pending images and continues after errors',async()=>{
 const abort=new AbortController(),pending=new Map<string,{resolve():void;reject():void}>(),load=vi.fn((path:string)=>new Promise<void>((resolve,reject)=>pending.set(path,{resolve,reject:()=>reject(Error('failed'))}))),worker=createEditorialImagePrefetcher(load,abort.signal);
 worker.prioritize(['/a','/b','/c','/d']);await tick();expect(load.mock.calls.flat()).toEqual(['/a','/b']);worker.prioritize(['/d','/c','/a']);pending.get('/a')!.resolve();await tick();await tick();expect(load.mock.calls.flat()).toEqual(['/a','/b','/d']);pending.get('/b')!.reject();await tick();await tick();expect(load.mock.calls.flat()).toEqual(['/a','/b','/d','/c']);abort.abort();worker.prioritize(['/never']);pending.get('/c')!.resolve();pending.get('/d')!.resolve();await tick();expect(load).toHaveBeenCalledTimes(4);
});
it('plans all carousel/group images without video sources and deduplicates split panels',()=>{
 const a:Article={id:eid(1),kind:'publication',canonicalPath:'/publications/demo',title:'Demo',summary:null,editorialDate:null,cover:null,authors:[],terms:[],alternatePaths:{},blocks:editorialBlocks(),relatedArticles:[],publicRevision:'1',commonRevision:'1'};
 const media=a.blocks.find(b=>b.type==='media');if(media?.type!=='media'||media.media.source?.kind!=='image')throw Error('fixture');a.blocks=[{id:eid(2),type:'carousel',variant:'default',automatic:false,intervalSeconds:5,slides:[...[0,1,2].map(n=>({id:eid(n+20),media:{...media.media,source:{assetId:eid(30),kind:'image' as const,srcPath:'/photo/'+n}}})),{id:eid(70),media:editorialVideo()}]}];const views=buildEditorialViews(a,'desktop');expect(editorialPrefetchPaths(views,a)).toEqual(['/photo/0','/photo/1','/photo/2']);a.blocks=[{id:eid(80),type:'imageGroup',variant:'default',format:'triptych',items:[81,82,83].map(n=>{const photo=editorialImage(n);if(photo.source?.kind!=='image')throw Error('fixture');return{id:eid(n+100),media:{...photo,video:null,source:{...photo.source,kind:'image' as const}}};})}];expect(editorialPrefetchPaths(buildEditorialViews(a,'mobile'),a)).toEqual([81,82,83].map(n=>'/media/'+eid(n)));
});
it('uses responsive srcset and low priority before setting src, and cancels detached images',async()=>{
 const images:{src:string;srcset:string;sizes:string;fetchPriority:string;onload:(()=>void)|null;onerror:(()=>void)|null;removeAttribute(name:string):void}[]=[];
 class ImageMock{src='';srcset='';sizes='';decoding='';fetchPriority='';onload:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(){images.push(this);}removeAttribute(){this.src='';}}
 vi.stubGlobal('Image',ImageMock);const path='/editorial-assets/'+eid(10),resource={resourceKind:'editorial' as const,resourceId:eid(10)},descriptor=physicalImageDescriptor(resource,{width:2400,height:1600,mimeType:'image/jpeg'},'fixture')!,abort=new AbortController();
 const pending=prefetchEditorialImage(path,abort.signal,{responsive:true,descriptor:async()=>descriptor});await tick();expect(images[0]!.srcset).toContain('image=r1-');expect(images[0]!.sizes).toBe('100vw');expect(images[0]!.fetchPriority).toBe('low');expect(images[0]!.src).not.toBe(path);images[0]!.onload!();await pending;
 const cancelled=prefetchEditorialImage('/next',abort.signal,{responsive:false}).catch(()=>{});abort.abort();await cancelled;expect(images[1]!.src).toBe('');
});
