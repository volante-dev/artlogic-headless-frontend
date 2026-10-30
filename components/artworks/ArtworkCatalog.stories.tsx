import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {useSiteContent} from "../SiteContentProvider";
import {useClientComponents} from "../../clients/ClientComponentsProvider";
import {galleryCatalog} from "../../.storybook/gallery-fixtures";
import {SiteHeader} from "../SiteHeader";
import {LanguageSelector} from "../LanguageSelector";
function CatalogStory({state="normal",header=false}:{state?:"normal"|"empty"|"search"|"error"|"changed";header?:boolean}){
  const {locale,defaultLocale,messages}=useSiteContent(),{ArtworkCatalog,ArtworkCard}=useClientComponents(),page=galleryCatalog(locale);
  const catalog=state==="error"||state==="changed"?{kind:"error" as const,code:state==="changed"?"catalog_changed" as const:"service_unavailable" as const,q:"",pageSize:3}:{kind:"numbered" as const,page:state==="empty"||state==="search"?{...page,query:state==="search"?"Absent":"",items:[],totalItems:0,pageCount:0}:page};
  return <>{header&&<SiteHeader siteName="Galerie" locale={locale} defaultLocale={defaultLocale} messages={messages} section="artworks" languageControl={<LanguageSelector policy={{defaultLocale,locales:[{code:"fr",label:"Français"},{code:"en",label:"English"}]}} locale={locale} path="/artworks" query="" label={messages["header.languageLabel"]}/>}/>}<ArtworkCatalog catalog={catalog} CardView={ArtworkCard}/></>;
}
const meta={title:"Gallery/ArtworkCatalog",component:CatalogStory,tags:["autodocs"]} satisfies Meta<typeof CatalogStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const CompletePage:Story={args:{header:true}};
export const Empty:Story={args:{state:"empty"}};
export const NoResults:Story={args:{state:"search"}};
export const Unavailable:Story={args:{state:"error"}};
export const CatalogChanged:Story={args:{state:"changed"}};
export const ClientOverride:Story={globals:{theme:"editorial",profile:"demo-gallery"}};
