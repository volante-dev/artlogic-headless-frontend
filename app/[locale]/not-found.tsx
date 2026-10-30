import {Suspense} from "react";
import {LocalizedNotFound} from "@/components/LocalizedNotFound";
export default function NotFound(){return <Suspense fallback={null}><LocalizedNotFound/></Suspense>;}
