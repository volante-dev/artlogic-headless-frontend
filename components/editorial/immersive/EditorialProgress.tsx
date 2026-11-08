"use client";
import {ViewProgress,type ViewProgressProps} from "../../navigation/ViewProgress";
import {useSiteContent} from "../../SiteContentProvider";
import {immersiveMessages} from "../../../lib/i18n/editorial-immersive";
export function EditorialProgress(props:Omit<ViewProgressProps,"navigationLabel"|"stepLabel"|"keepActiveVisible">){
 const site=useSiteContent(),m=immersiveMessages(site.locale,site.defaultLocale);
 return <ViewProgress {...props} keepActiveVisible navigationLabel={m.progress} stepLabel={(index,total)=>`${m.view} ${index+1} ${m.of} ${total}`}/>;
}
