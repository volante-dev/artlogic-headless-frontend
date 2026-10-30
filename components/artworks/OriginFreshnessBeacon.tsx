"use client";
import {useEffect} from "react";
/** Emitted only after the server has completed this page's current public reads. */
export function OriginFreshnessBeacon({nonce}:{nonce:string}){
  useEffect(()=>{window.dispatchEvent(new CustomEvent("artwork-origin-ready",{detail:{nonce,href:location.pathname+location.search}}));},[nonce]);
  return null;
}
