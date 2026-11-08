"use client";
import {LoadingIndicator} from "../../SiteLoading";
import IconButton from "@mui/material/IconButton";
import {useSiteContent} from "../../SiteContentProvider";
import {Button} from "../../ui/Button";
import {Typography} from "../../ui/Typography";
import type {useEditorialPlayback} from "./useEditorialPlayback";
import styles from "./Player.module.css";
function Icon({name}:{name:"play"|"pause"|"sound"|"muted"|"fullscreen"}){
 const paths={play:"M7 4l14 8-14 8z",pause:"M7 4v16 M17 4v16",sound:"M4 9h4l5-5v16l-5-5H4z M17 8a6 6 0 0 1 0 8 M20 5a10 10 0 0 1 0 14",muted:"M4 9h4l5-5v16l-5-5H4z M17 9l6 6 M23 9l-6 6",fullscreen:"M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6"};
 return <svg width="22" height="22" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
export function PlayerChrome({state,showSoundControl=true}:{state:Omit<ReturnType<typeof useEditorialPlayback>,"hostRef">;showSoundControl?:boolean}){
 const {messages:m}=useSiteContent(),{status,muted}=state.snapshot,playing=status==="playing";
 return <><div data-editorial-player-controls className={styles.controls} aria-label={m["editorial.play"]}>
  <IconButton aria-label={playing?m["editorial.pause"]:m["editorial.play"]} disabled={["loading","starting","error"].includes(status)} onClick={playing?state.pause:state.play}><Icon name={playing?"pause":"play"}/></IconButton>
  {showSoundControl&&<IconButton aria-label={muted?m["editorial.soundOn"]:m["editorial.soundOff"]} aria-pressed={!muted} disabled={status==="loading"||status==="error"} onClick={state.toggleSound}><Icon name={muted?"muted":"sound"}/></IconButton>}
  {state.canFullscreen&&<IconButton aria-label={m["editorial.fullscreen"]} onClick={()=>void state.fullscreen()}><Icon name="fullscreen"/></IconButton>}
  {status==="loading"||status==="starting"?<span className={styles.loader} aria-hidden="true"><LoadingIndicator compact decorative/></span>:null}
 </div>{status==="blocked"&&<Typography variant="body2" role="status" className={styles.notice}>{m["editorial.autoplayBlocked"]}</Typography>}{status==="error"&&<div className={styles.notice}><Typography role="alert">{m["editorial.videoUnavailable"]}</Typography><Button variant="outlined" onClick={state.retry}>{m["editorial.retry"]}</Button></div>}</>;
}
