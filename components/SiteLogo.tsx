"use client";
import {useState} from "react";
import Image from "next/image";
import type {SiteContent} from "@/lib/api/site-content";
export function SiteLogo({logo,siteName}:{logo:SiteContent["logo"];siteName:string}){const [failed,setFailed]=useState(false);if(!logo||failed)return <span>{siteName}</span>;return <Image unoptimized data-testid="site-logo" src={"/site-logos/"+logo.id} width={logo.width} height={logo.height} alt="" loading="eager" onError={()=>setFailed(true)} style={{maxWidth:200,maxHeight:72,width:"auto",height:"auto",objectFit:"contain"}}/>;}
