"use client";
import{useEffect}from"react";
/** Signals readiness only to the configured admin, without leaking article content. */
export function PreviewReadySignal({adminOrigin,snapshotId}:{adminOrigin:string;snapshotId:string}){useEffect(()=>{const target=window.opener??(window.parent!==window?window.parent:null);target?.postMessage({type:"editorial-preview-ready",snapshotId},adminOrigin);},[adminOrigin,snapshotId]);return null;}
