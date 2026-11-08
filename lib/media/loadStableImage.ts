import {MediaDisplayAttempt} from "./display-state";
import {sendMediaObservation} from "./observations";
/** Best-effort preload: stable references only, one retry, and cancellation. */
export function loadStableImage(path:string,signal?:AbortSignal,budgetMs=60000):Promise<void>{
 if(typeof document!=="undefined"&&document.body.dataset.publicResponsive==="true"&&/^\/(media|site-logos|presentation-assets|editorial-assets)\/[a-f0-9-]{36}/i.test(path)){
  const node=[...document.querySelectorAll<HTMLImageElement>('img[data-public-image-path]')].find(n=>n.dataset.publicImagePath===path||n.getAttribute('src')===path);
  // Decode the mounted responsive image. Never preload its full-reference src alone.
  if(!node)return Promise.reject(Error("responsive_preparation_not_mounted"));
  if(node.complete&&node.naturalWidth)return node.decode();
  return new Promise((resolve,reject)=>{let done=false;const finish=(ok:boolean)=>{if(done)return;done=true;clearTimeout(timer);node.removeEventListener('load',loaded);node.removeEventListener('error',failed);signal?.removeEventListener('abort',failed);ok?resolve():reject(Error('responsive_preparation_unavailable'));},loaded=()=>{void node.decode().then(()=>finish(true),()=>finish(false));},failed=()=>finish(false),timer=setTimeout(failed,budgetMs);node.addEventListener('load',loaded,{once:true});node.addEventListener('error',failed,{once:true});signal?.addEventListener('abort',failed,{once:true});if(signal?.aborted)failed();});
 }
 return new Promise((resolve,reject)=>{
  const migrated=/^\/(media|site-logos)\/([0-9a-f-]{36})$/.exec(path),id="preload:"+crypto.randomUUID();
  const attempt=new MediaDisplayAttempt(path,id,budgetMs),image=new Image();let done=false;
  const report=(event:"loaded"|"failed"|"timeout"|"retry")=>{if(migrated)sendMediaObservation({resourceKind:migrated[1]==="media"?"artwork":"siteLogo",resourceId:migrated[2]!,displayId:id,retry:attempt.snapshot().retry,event,elapsedMs:Math.min(180000,budgetMs-attempt.remaining())});};
  const finish=(ok:boolean)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener("abort",abort);image.onload=null;image.onerror=null;if(!ok)image.removeAttribute("src");if(ok)resolve();else reject(Error("editorial_image_unavailable"));};
  const abort=()=>finish(false),timer=setTimeout(()=>{report("timeout");finish(false);},budgetMs);
  image.onload=()=>{void image.decode().then(()=>{if(done)return;report("loaded");finish(true);},()=>image.onerror?.(new Event("error")));};
  image.onerror=()=>{if(done)return;report("failed");if(!migrated||attempt.snapshot().retry===1||!attempt.remaining()){finish(false);return;}attempt.fail();report("retry");image.src=attempt.snapshot().src;};
  if(signal?.aborted){finish(false);return;}signal?.addEventListener("abort",abort,{once:true});attempt.start();image.src=migrated?attempt.snapshot().src:path;
 });
}
