'use client';
import {useEffect,useState,useCallback} from 'react';
import {storeRequest,storeErrorMessage,StoreRequestError} from './client';
import type {components} from './contract-types.generated';
export function isCommerceAttemptPending(status:string){return ['creating','payable','processing','reconciling','cancel_requested'].includes(status);}
export function useAttemptStatus(id:string,locale:string){
 const [attempt,setAttempt]=useState<components['schemas']['CommerceAttempt']|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[stopped,setStopped]=useState(false),[generation,setGeneration]=useState(0);
 useEffect(()=>{
  let alive=true,timer:ReturnType<typeof setTimeout>|undefined,inFlight=false,first=true,finished=false;const began=Date.now(),controller=new AbortController();
  async function read(){
   if(!alive||finished||inFlight||document.visibilityState==='hidden')return;
   if(!first&&(generation>0||Date.now()-began>=30000)){finished=true;setStopped(true);return;}
   first=false;inFlight=true;
   try{const result=await storeRequest<components['schemas']['CommerceAttempt']>(['attempts',id],{method:'GET',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});if(!alive)return;setAttempt(result);setError('');
    if(!isCommerceAttemptPending(result.status)){finished=true;setStopped(true);return;}
   }catch(e){if(alive){setError(storeErrorMessage(e,locale));if(e instanceof StoreRequestError&&[401,403,404].includes(e.status)){finished=true;setStopped(true);return;}}}
   finally{inFlight=false;if(alive)setLoading(false);}
   if(alive&&generation===0&&Date.now()-began<30000)timer=setTimeout(()=>void read(),2000);else if(alive){finished=true;setStopped(true);}
  }
  const visibility=()=>{if(document.visibilityState==='hidden')clearTimeout(timer);else void read();};
  document.addEventListener('visibilitychange',visibility);void read();
  return()=>{alive=false;clearTimeout(timer);controller.abort();document.removeEventListener('visibilitychange',visibility);};
 },[id,locale,generation]);
 const refresh=useCallback(()=>{setLoading(true);setStopped(false);setGeneration(g=>g+1);},[]);
 return {attempt,error,loading,stopped,refresh};
}
