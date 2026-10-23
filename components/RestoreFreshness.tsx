"use client";
import {useEffect} from "react";
export function RestoreFreshness(){useEffect(()=>{const fresh=(event:PageTransitionEvent)=>{if(event.persisted)window.location.reload();};window.addEventListener("pageshow",fresh);return()=>window.removeEventListener("pageshow",fresh);},[]);return null;}
