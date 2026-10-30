import {connection} from "next/server";
import {readPreviewStatus} from "@/lib/presentation/preview-client";
import {previewCookieSettings} from "@/lib/presentation/preview-cookies";
import {loadConfig,stringValue,configuredLocalePolicy} from "@/lib/config/env";
import {PreviewShell,PreviewUnavailable} from "@/components/preview/PreviewShell";
export default async function PreviewPage(){await connection();const adminOrigin=stringValue(loadConfig(),"ADMIN_ORIGIN");let status;try{status=await readPreviewStatus();}catch{return <PreviewUnavailable adminOrigin={adminOrigin}/>;}return <PreviewShell adminOrigin={adminOrigin} initial={status} locales={configuredLocalePolicy(loadConfig()).locales} csrfCookie={previewCookieSettings().names.csrf}/>;}
