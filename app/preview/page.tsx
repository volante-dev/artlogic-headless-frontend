import {connection} from "next/server";
import {Suspense} from "react";
import {readPreviewStatus} from "@/lib/presentation/preview-client";
import {previewCookieSettings} from "@/lib/presentation/preview-cookies";
import {loadConfig,stringValue,configuredLocalePolicy} from "@/lib/config/env";
import {PreviewShell,PreviewUnavailable,PreviewLoading} from "@/components/preview/PreviewShell";
export default function PreviewPage(){return <Suspense fallback={<PreviewLoading/>}><PreviewContent/></Suspense>;}
async function PreviewContent(){await connection();const adminOrigin=stringValue(loadConfig(),"ADMIN_ORIGIN");let status;try{status=await readPreviewStatus();}catch{return <PreviewUnavailable adminOrigin={adminOrigin}/>;}return <PreviewShell adminOrigin={adminOrigin} initial={status} locales={configuredLocalePolicy(loadConfig()).locales} csrfCookie={previewCookieSettings().names.csrf}/>;}
