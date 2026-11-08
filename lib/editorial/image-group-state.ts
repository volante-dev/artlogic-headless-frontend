/** Identity-based selection. A removed image yields to its next surviving neighbour. */
export function reconcileImageGroupItem(previousIds:readonly string[],nextIds:readonly string[],activeId:string|null):string|null{
 if(activeId&&nextIds.includes(activeId))return activeId;
 const index=activeId?previousIds.indexOf(activeId):-1;
 return nextIds[Math.min(Math.max(0,index),nextIds.length-1)]??null;
}
