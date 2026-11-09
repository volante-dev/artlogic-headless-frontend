import {buildImageAttributes,publicImageResource,type ImageDescriptor,type ImageResource} from '../../media/public-image-url';
import {viewImagePaths,type Article,type EditorialView} from './build-views';
/** Images only: preparing a later view must never mount players, forms or embeds. */
export function editorialPrefetchPaths(views:readonly EditorialView[],article:Article,start=0):string[]{
 const ordered=[...views.slice(start),...views.slice(0,start)];
 return [...new Set(ordered.flatMap(view=>{
  if(view.kind==='block'&&view.block.type==='carousel')return view.block.slides.flatMap(slide=>{const s=slide.media.source;return s&&(s.kind==='image'||s.kind==='artwork')?[s.srcPath]:[];});
  if(view.kind==='block'&&view.block.type==='imageGroup')return view.block.items.map(item=>item.media.source.srcPath);
  return viewImagePaths(view,article);
 }))];
}
export function createEditorialImagePrefetcher(load:(path:string)=>Promise<void>,signal:AbortSignal,canLoad:()=>boolean=()=>true){
 const attempted=new Set<string>();let queue:string[]=[],active=0;
 const pump=()=>{while(!signal.aborted&&canLoad()&&active<2&&queue.length){const path=queue.shift()!;if(attempted.has(path))continue;attempted.add(path);active++;void Promise.resolve().then(()=>load(path)).catch(()=>{}).finally(()=>{active--;pump();});}};
 return {prioritize(paths:readonly string[]){queue=[...new Set(paths)].filter(path=>!attempted.has(path));pump();}};
}
interface Options {responsive:boolean;descriptor?:(resource:ImageResource)=>Promise<ImageDescriptor|undefined>}
/** Match the real 100vw editorial images' srcset, letting the browser choose its rendition. */
export async function prefetchEditorialImage(path:string,signal:AbortSignal,options:Options):Promise<void>{
 if(signal.aborted)return;const resource=publicImageResource(path),descriptor=options.responsive&&resource?await options.descriptor?.(resource):undefined;if(signal.aborted)return;
 const attributes=descriptor?buildImageAttributes(descriptor,'100vw'):{src:path,srcSet:undefined,sizes:undefined};
 return new Promise((resolve,reject)=>{const image=new Image();let done=false;
  const finish=(ok:boolean)=>{if(done)return;done=true;clearTimeout(timer);signal.removeEventListener('abort',abort);image.onload=null;image.onerror=null;if(!ok){image.removeAttribute('srcset');image.removeAttribute('src');}if(ok)resolve();else reject(Error('editorial_prefetch_unavailable'));};
  const abort=()=>finish(false),timer=setTimeout(()=>finish(false),15000);signal.addEventListener('abort',abort,{once:true});image.onload=()=>finish(true);image.onerror=()=>finish(false);image.decoding='async';image.fetchPriority='low';if(attributes.sizes)image.sizes=attributes.sizes;if(attributes.srcSet)image.srcset=attributes.srcSet;image.src=attributes.src;
  if(signal.aborted)abort();
 });
}
