import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {useWatch,useFormContext,FormProvider,useForm} from "react-hook-form";
import {Box,Button,Stack,Typography} from "@mui/material";
import {FormView,type FormViewProps} from "./FormView";
import {FormField} from "./FormField";
import {FormRenderer} from "./FormRenderer";
import {FormSessionProvider} from "./FormSessionProvider";
import {visibleFormFields} from "@/lib/forms/conditions.generated";
import {formAnswersResolver,type FormRuntimeValues} from "@/lib/forms/resolver";
import type {FormDocument,FormField as Field} from "@/lib/forms/model.generated";
const noop=()=>{};
const field=(id:string,type:Field["type"],fr:string,en:string):Field=>({id,type,stepId:"step",rowId:id,column:1,required:type!=="checkbox",constraints:{},translations:{fr:{label:fr},en:{label:en}}});
const document:FormDocument={schemaVersion:1,kind:"classic",translations:{fr:{title:"Écrivez à la galerie",submitLabel:"Envoyer",successMessage:"Votre demande a été reçue.",closedMessage:"Ce formulaire est fermé."},en:{title:"Write to the gallery",submitLabel:"Send",successMessage:"Your request has been received.",closedMessage:"This form is closed."}},steps:[{id:"step",translations:{fr:"Votre demande",en:"Your request"}}],fields:[field("name","shortText","Nom","Name"),field("email","email","Adresse e-mail","Email address"),field("details","checkbox","Ajouter des précisions","Add details"),{...field("message","longText","Votre message","Your message"),condition:{fieldId:"details",operator:"checked"}}]};
function Fields({locale,disabled}:{locale:string;disabled:boolean}){const {control}=useFormContext<FormRuntimeValues>(),answers=useWatch({control,name:"answers"})??{},visible=new Set(visibleFormFields(document,answers));return <Stack spacing={3}>{document.fields.filter(field=>visible.has(field.id)).map(field=><FormField key={field.id} field={field} locale={locale} inert={disabled}/>)}</Stack>;}
/** Pure visual fixture: callbacks are local, no transport, capabilities or session proof. */
function Catalog({phase="editing",locale="fr"}:{phase?:FormViewProps["phase"];locale?:string}){const methods=useForm<FormRuntimeValues>({defaultValues:{answers:{name:"Camille Martin",email:"camille@example.test",details:false,message:""}},resolver:formAnswersResolver(document,locale)}),fr=locale.startsWith("fr");return <Box sx={{p:{xs:3,md:6},maxWidth:900,mx:"auto"}}><FormProvider {...methods}><FormView phase={phase} locale={locale} title={document.translations[locale]?.title} notice={phase==="closed"?(fr?"Ce formulaire est fermé.":"This form is closed."):phase==="expired"?(fr?"Session expirée. Vos informations sont conservées ; ajoutez à nouveau vos images.":"Session expired. Your details are kept; add your images again."):undefined} reference="DEMO-2026-001" animation={false} body={<Fields locale={locale} disabled={phase!=="editing"}/>} stepNavigation={<Button type="button" disabled>{fr?"Envoi désactivé dans le catalogue":"Submissions disabled in the catalog"}</Button>} onSubmit={noop} onRecover={noop} onRestart={noop}/><Typography variant="caption" sx={{display:"block",mt:4}}>{fr?"Données fictives · aucun envoi":"Synthetic data · no submissions"}</Typography></FormProvider></Box>;}
const meta={title:"Forms/Form",component:Catalog,parameters:{layout:"fullscreen"},args:{phase:"editing",locale:"fr"},render:(args,context)=><Catalog {...args} locale={String(context.globals.locale??args.locale)}/>} satisfies Meta<typeof Catalog>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Ready:Story={};
export const Loading:Story={args:{phase:"loading"}};
export const Closed:Story={args:{phase:"closed"}};
export const Expired:Story={args:{phase:"expired"}};
export const Error:Story={args:{phase:"error"}};
export const Sent:Story={args:{phase:"accepted"}};
export const Uncertain:Story={args:{phase:"uncertain"}};
export const Inert:Story={render:(_args,context)=><Box sx={{p:4}}><FormSessionProvider formId="90000000-0000-4000-8000-000000000001" placement={{ownerType:"page",ownerId:"contact"}} locale={String(context.globals.locale??"fr")} mode="inert"><FormRenderer/></FormSessionProvider></Box>};
