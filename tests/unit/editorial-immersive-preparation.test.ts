import{it,expect,vi}from'vitest';import{prepareEditorialImages}from'../../lib/editorial/immersive/prepare-media';
it('uses one budget for all images and cancels obsolete requests',async()=>{vi.useFakeTimers();try{const abort=new AbortController();const preparation=prepareEditorialImages(['/a','/b'],abort.signal,()=>new Promise(()=>{}));await vi.advanceTimersByTimeAsync(1500);expect(await preparation).toBe('budget');const second=prepareEditorialImages(['/c'],abort.signal,()=>new Promise(()=>{}));abort.abort();expect(await second).toBe('cancelled');expect(vi.getTimerCount()).toBe(0);}finally{vi.useRealTimers();}});
it('known failures and no media never wait on a video player',async()=>{expect(await prepareEditorialImages([],new AbortController().signal)).toBe('ready');expect(await prepareEditorialImages(['/missing'],new AbortController().signal,async()=>{throw Error();})).toBe('error');});


it('prepares the image in the incoming view rather than another occurrence of the same path',async()=>{
 const {loadStableImage}=await import('../../lib/media/loadStableImage');
 class ImageNode extends EventTarget{complete=false;naturalWidth=0;dataset={publicImagePath:'/media/00000000-0000-4000-8000-000000000001'};decode=vi.fn(async()=>{});getAttribute(){return this.dataset.publicImagePath;}}
 const incoming=new ImageNode(),scope={querySelectorAll:()=>[incoming]},query=vi.fn(()=>[]);
 vi.stubGlobal('document',{body:{dataset:{publicResponsive:'true'}},querySelectorAll:query});
 try{const preparation=loadStableImage(incoming.dataset.publicImagePath,undefined,500,scope as unknown as ParentNode);let ready=false;void preparation.then(()=>{ready=true;});await Promise.resolve();expect(ready).toBe(false);expect(query).not.toHaveBeenCalled();incoming.complete=true;incoming.naturalWidth=100;incoming.dispatchEvent(new Event('load'));await preparation;expect(incoming.decode).toHaveBeenCalledOnce();}finally{vi.unstubAllGlobals();}
});
