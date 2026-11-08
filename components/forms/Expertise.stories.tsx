import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {Box,Button,Stack,Typography} from "@mui/material";
import {FormView,type FormViewProps} from "./FormView";
import {FormRenderer} from "./FormRenderer";
import {FormSessionProvider} from "./FormSessionProvider";
const noop=()=>{};
/** Catalog-only projection. No upload store or private signed URLs can run here. */
function ExpertiseCatalog({phase="editing",photos=0,locale="fr"}:{phase?:FormViewProps["phase"];photos?:number;locale?:string}){const fr=locale.startsWith("fr");return <Box sx={{p:{xs:3,md:6},maxWidth:1440,mx:"auto"}}><FormView phase={phase} locale={locale} title={fr?"Demande d’expertise":"Expertise request"} intro={fr?"Ajoutez les photos de vos objets, puis organisez votre demande.":"Add photos of your objects, then organize your request."} notice={phase==="closed"?(fr?"Les demandes sont momentanément fermées.":"Requests are currently closed."):phase==="expired"?(fr?"Votre session a expiré. Ajoutez à nouveau vos photos.":"Your session has expired. Add your photos again."):undefined} reference="DEMO-EXPERTISE-001" animation={false} onSubmit={noop} onRecover={noop} onRestart={noop} body={<Stack spacing={3}><Box aria-disabled="true" sx={{border:"1px dashed",borderColor:"divider",p:4,textAlign:"center"}}><Typography>{fr?"Déposez vos images ici":"Drop your images here"}</Typography><Button type="button" disabled>{fr?"Choisir des images":"Choose images"}</Button></Box>{photos>0&&<><Typography component="h3" variant="h5">{fr?`${photos} photos · 10 objets`:`${photos} photos · 10 objects`}</Typography><Box component="ul" sx={{m:0,p:0,listStyle:"none",display:"grid",gridTemplateColumns:{xs:"repeat(2,minmax(0,1fr))",md:"repeat(5,minmax(0,1fr))"},gap:2}}>{Array.from({length:photos},(_,index)=><Box component="li" key={index} sx={{border:"1px solid",borderColor:"divider",minWidth:0}}><Box component="img" src="/demo/gallery/limestone.png" alt="" sx={{width:"100%",aspectRatio:"4 / 3",objectFit:"cover",display:"block"}}/><Box sx={{p:2}}><Typography sx={{fontSize:14,overflowWrap:"anywhere"}}>{fr?"Objet":"Object"} {Math.floor(index/5)+1} · {index%5+1}</Typography><Typography variant="caption">{fr?"Prête":"Ready"}</Typography></Box></Box>)}</Box></>}</Stack>} stepNavigation={<Button type="button" disabled>{fr?"Aucun envoi depuis cet aperçu":"No submissions from this preview"}</Button>}/></Box>;}
const meta={title:"Forms/Expertise",component:ExpertiseCatalog,args:{phase:"editing",photos:0,locale:"fr"},parameters:{layout:"fullscreen"},render:(args,context)=><ExpertiseCatalog {...args} locale={String(context.globals.locale??args.locale)}/>} satisfies Meta<typeof ExpertiseCatalog>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Ready:Story={};
export const FiftyImages:Story={args:{photos:50}};
export const Loading:Story={args:{phase:"loading"}};
export const Closed:Story={args:{phase:"closed"}};
export const Expired:Story={args:{phase:"expired",photos:50}};
export const Error:Story={args:{phase:"error"}};
export const Sent:Story={args:{phase:"accepted"}};
export const Inert:Story={render:(_args,context)=><Box sx={{p:4}}><FormSessionProvider formId="90000000-0000-4000-8000-000000000002" placement={{ownerType:"page",ownerId:"expertise"}} locale={String(context.globals.locale??"fr")} mode="inert"><FormRenderer/></FormSessionProvider></Box>};
