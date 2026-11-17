/** Browser media suspension can finish after the foreground event, especially on iOS.
 * Reconcile briefly after returning, without polling while the page is in use. */
export function onPageReturn(reconcile:()=>void){
 let frame=0;const timers=new Set<ReturnType<typeof setTimeout>>();
 const cancel=()=>{cancelAnimationFrame(frame);for(const timer of timers)clearTimeout(timer);timers.clear();};
 const refresh=()=>{if(document.visibilityState==="visible")reconcile();};
 const resume=()=>{
  cancel();if(document.visibilityState!=="visible")return;
  refresh();frame=requestAnimationFrame(refresh);
  for(const delay of [250,1000]){const timer=setTimeout(()=>{timers.delete(timer);refresh();},delay);timers.add(timer);}
 };
 document.addEventListener("visibilitychange",resume);
 window.addEventListener("pageshow",resume);window.addEventListener("focus",resume);window.addEventListener("pagehide",cancel);
 return()=>{cancel();document.removeEventListener("visibilitychange",resume);window.removeEventListener("pageshow",resume);window.removeEventListener("focus",resume);window.removeEventListener("pagehide",cancel);};
}
