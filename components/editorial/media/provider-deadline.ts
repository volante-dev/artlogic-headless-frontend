export function playerDeadline<T>(work:Promise<T>,signal:AbortSignal,milliseconds=10000):Promise<T>{
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{clearTimeout(timer);signal.removeEventListener("abort",abort);};
  const abort=()=>{cleanup();reject(new Error("player_aborted"));};
  const timer=setTimeout(()=>{cleanup();reject(new Error("player_timeout"));},milliseconds);
  if(signal.aborted){void work.catch(()=>undefined);abort();return;}signal.addEventListener("abort",abort,{once:true});
  work.then(value=>{cleanup();resolve(value);},error=>{cleanup();reject(error);});
 });
}
