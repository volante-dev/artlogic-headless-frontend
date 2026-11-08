'use client';
import {useEffect} from 'react';
/** Preserve focus transfers for accessibility without drawing keyboard rings after taps. */
export function FocusVisibility(){
 useEffect(()=>{
  const root=document.documentElement;
  const pointer=()=>{root.dataset.focusInput='pointer';};
  const keyboard=(event:KeyboardEvent)=>{if(!event.metaKey&&!event.ctrlKey&&!['Shift','Alt','Control','Meta'].includes(event.key))root.dataset.focusInput='keyboard';};
  document.addEventListener('pointerdown',pointer,true);document.addEventListener('keydown',keyboard,true);
  return()=>{document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',keyboard,true);delete root.dataset.focusInput;};
 },[]);
 return null;
}
