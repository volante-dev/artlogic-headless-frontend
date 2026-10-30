export const artworkOpeningTiming={backdrop:500,media:700,controls:220,identity:300} as const;
export const artworkOpeningDuration=artworkOpeningTiming.backdrop+artworkOpeningTiming.media+artworkOpeningTiming.controls+artworkOpeningTiming.identity;
export interface OpeningState {id:number;openedAt:number;revealStartedAt:number|null;completedAt:number|null}
export type OpeningPhase="backdrop"|"waiting"|"media"|"controls"|"identity"|"complete";
export function beginOpening(id:number,now:number):OpeningState{return {id,openedAt:now,revealStartedAt:null,completedAt:null};}
export function readyOpening(s:OpeningState,now:number):OpeningState{return s.completedAt!==null||s.revealStartedAt!==null?s:{...s,revealStartedAt:Math.max(s.openedAt+artworkOpeningTiming.backdrop,now)};}
export function completeOpening(s:OpeningState,now:number):OpeningState{return s.completedAt!==null?s:{...s,completedAt:now};}
export function openingPhase(s:OpeningState,now:number):OpeningPhase{
 if(s.completedAt!==null)return "complete";
 if(s.revealStartedAt===null||now<s.revealStartedAt)return now<s.openedAt+artworkOpeningTiming.backdrop?"backdrop":"waiting";
 const t=now-s.revealStartedAt;return t<artworkOpeningTiming.media?"media":t<artworkOpeningTiming.media+artworkOpeningTiming.controls?"controls":t<artworkOpeningDuration-artworkOpeningTiming.backdrop?"identity":"complete";
}
export function openingDuration(s:OpeningState){return s.completedAt===null||s.revealStartedAt===null?0:s.completedAt-s.openedAt-Math.max(0,s.revealStartedAt-s.openedAt-artworkOpeningTiming.backdrop);}
