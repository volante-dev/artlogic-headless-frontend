"use client";
import {useLayoutEffect} from "react";
import {useHeaderNavigation} from "@/components/header/HeaderNavigationProvider";
import {useSiteContent} from "@/components/SiteContentProvider";
import {Typography} from "@/components/ui/Typography";
import {Button} from "@/components/ui/Button";
export default function GaleristError({retry}:{retry:()=>void}){const navigation=useHeaderNavigation(),fail=navigation?.fail,registerRecovery=navigation?.registerRecovery;useLayoutEffect(()=>{fail?.();},[fail]);useLayoutEffect(()=>registerRecovery?.(retry),[registerRecovery,retry]);const {messages}=useSiteContent();return <section><Typography variant="h1">{messages["error.presentationTitle"]}</Typography><Typography role="alert">{messages["error.presentationMessage"]}</Typography><Button onClick={()=>navigation?.status==="error"?navigation.retry():retry()}>{messages["catalog.retry"]}</Button></section>;}
