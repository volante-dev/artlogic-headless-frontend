'use client';
import {useOptimistic,useRef,useEffect,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {catalogQueryString} from '../../lib/artworks/catalog-query';
/** URL remains the source of navigation; optimistic selection is independent of network latency. */
export function useArtworkTypeFilters(path:string,q:string,pageSize:number,serverIds:number[]){
 const router=useRouter(),[pending,startTransition]=useTransition(),[selected,setSelected]=useOptimistic(serverIds,(_previous:number[],next:number[])=>next),latest=useRef(selected),signature=serverIds.join(',');
 useEffect(()=>{if(!pending){latest.current=serverIds;}},[signature,pending]); // eslint-disable-line react-hooks/exhaustive-deps
 const change=(ids:number[])=>{latest.current=ids;startTransition(()=>{setSelected(ids);router.push(path+catalogQueryString({q:q||undefined,pageSize,types:ids}),{scroll:false});});};
 return {selected,pending,change,toggle:(id:number)=>{const ids=latest.current;change(ids.includes(id)?ids.filter(n=>n!==id):[...ids,id].sort((a,b)=>a-b));}};
}
