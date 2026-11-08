import {EditorialExecutionProvider} from "../lib/editorial/execution";
import {ContactExecutionProvider} from "../lib/contact/execution";
import type {Preview} from "@storybook/nextjs-vite";
import {useEffect} from "react";
import {SiteThemeProvider} from "../branding/SiteThemeProvider";
import {SiteContentProvider} from "../components/SiteContentProvider";
import {ClientComponentsProvider} from "../clients/ClientComponentsProvider";
import {projectionTheme} from "../clients/default/manifest";
import {demoGalleryManifest} from "../clients/demo-gallery/manifest";
import {initialMessages} from "../lib/i18n/messages.generated";
import "../app/globals.css";

function Canvas({children,locale,profile,theme,width}:{children:React.ReactNode;locale:string;profile:string;theme:string;width:number}){
  useEffect(()=>{document.documentElement.lang=locale;},[locale]);
  return <SiteThemeProvider theme={theme==="editorial"?demoGalleryManifest.theme.base:projectionTheme} fonts={[]}>
    <SiteContentProvider locale={locale} defaultLocale="fr" locales={["fr","en"]} messages={initialMessages(locale)}>
      <EditorialExecutionProvider mode="inert"><ContactExecutionProvider mode="inert"><ClientComponentsProvider profileId={profile}>
        <div data-catalog-ready="true" data-profile={profile} data-locale={locale} style={{width:"100%",maxWidth:width,marginInline:"auto"}}>{children}</div>
      </ClientComponentsProvider></ContactExecutionProvider></EditorialExecutionProvider>
    </SiteContentProvider>
  </SiteThemeProvider>;
}
const preview:Preview={
  parameters:{layout:"fullscreen",nextjs:{appDirectory:true},a11y:{test:"error"},controls:{expanded:true}},
  globalTypes:{
    playback:{description:"Controlled playback tests only",toolbar:{title:"Playback",items:["inert","live"]}},
    theme:{description:"Installed identity",toolbar:{title:"Theme",items:[{value:"projection",title:"Projection"},{value:"editorial",title:"Editorial"}],dynamicTitle:true}},
    profile:{description:"Typed component overrides",toolbar:{title:"Profile",items:["default","demo-gallery"],dynamicTitle:true}},
    locale:{description:"Public language",toolbar:{title:"Language",items:[{value:"fr",title:"Français"},{value:"en",title:"English"}],dynamicTitle:true}},
    width:{description:"Canvas width",toolbar:{title:"Width",items:[{value:375,title:"Mobile · 375"},{value:1440,title:"Desktop · 1440"}],dynamicTitle:true}},
  },
  initialGlobals:{theme:"projection",profile:"default",locale:"fr",width:1440,playback:"inert"},
  decorators:[(Story,context)=><Canvas locale={String(context.globals.locale)} profile={String(context.globals.profile)} theme={String(context.globals.theme)} width={Number(context.globals.width)}><Story/></Canvas>],
};
export default preview;
