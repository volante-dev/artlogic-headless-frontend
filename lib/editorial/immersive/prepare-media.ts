import {loadStableImage} from "../../media/loadStableImage";
import{mediaPreparationBudgetMs}from'./motion-catalog';
export type PreparationResult='ready'|'budget'|'cancelled'|'error';
/** One shared time budget, including decode. No player/iframe or permission side effect. */
export function prepareEditorialImages(paths:readonly string[],signal:AbortSignal,load:(path:string)=>Promise<void>=(path=>loadStableImage(path,signal))):Promise<PreparationResult>{
 if(signal.aborted)return Promise.resolve('cancelled');if(!paths.length)return Promise.resolve('ready');
 return new Promise(resolve=>{let done=false;const finish=(result:PreparationResult)=>{if(done)return;done=true;clearTimeout(timer);signal.removeEventListener('abort',abort);resolve(result);};const abort=()=>finish('cancelled');const timer=setTimeout(()=>finish('budget'),mediaPreparationBudgetMs);signal.addEventListener('abort',abort,{once:true});Promise.all([...new Set(paths)].map(path=>load(path))).then(()=>finish('ready'),()=>finish('error'));});
}
