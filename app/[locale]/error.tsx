"use client";
import {useSiteContent} from "@/components/SiteContentProvider";
import {usePathname} from "next/navigation";
import {Typography} from "@/components/ui/Typography";
import {Button} from "@/components/ui/Button";
export default function Error({retry}:{retry:()=>void}){const {messages:m}=useSiteContent(),catalog=usePathname().split("/").includes("artworks");return <section><Typography variant="h1">{m[catalog?"catalog.errorTitle":"error.presentationTitle"]}</Typography><Typography role="alert">{m[catalog?"catalog.errorMessage":"error.presentationMessage"]}</Typography><Button onClick={retry}>{m["catalog.retry"]}</Button></section>;}
