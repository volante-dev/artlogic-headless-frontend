"use client";
import {Button} from "@mui/material";
import {useClientComponents} from "@/clients/ClientComponentsProvider";
import {ExpertiseProvider,useExpertise,expertisePhotoFieldId} from "./ExpertiseProvider";
import {ExpertiseModal} from "./ExpertiseModal";
import {BatchImageDropzone} from "./BatchImageDropzone";
import {type FormAnimation} from "./FormEntrance";
import styles from "./Expertise.module.css";
const ignore=()=>{};
export function ExpertiseRenderer({animation,hideTitle=false}:{animation:FormAnimation|false;hideTitle?:boolean}){return <ExpertiseProvider><Entry animation={animation} hideTitle={hideTitle}/><ExpertiseModal/></ExpertiseProvider>;}
function Entry({animation,hideTitle=false}:{animation:FormAnimation|false;hideTitle?:boolean}){
 const {runtime,open:openDialog,registerTrigger,items,objects}=useExpertise(),{Form:View}=useClientComponents();if(runtime.entry.status!=="ready")return null;const state=runtime.entry.state,translation=state.session.document.translations[runtime.locale],fr=runtime.locale.startsWith("fr");
 if(state.phase==="accepted")return <View phase="accepted" locale={runtime.locale} successMessage={translation?.successMessage} reference={state.receipt?.reference} onRestart={runtime.restart} onSubmit={runtime.submit} onRecover={runtime.recover}/>;
 return <div className={styles.entry}><View hideTitle={hideTitle} phase="editing" locale={runtime.locale} title={translation?.title} intro={translation?.intro??(fr?"Ajoutez les photos de vos objets pour préparer votre demande d’expertise. Vous pourrez ensuite les organiser et renseigner leurs informations.":"Add photos of your objects to prepare an expertise request. You can then organize them and describe each object.")} body={<BatchImageDropzone fieldId={expertisePhotoFieldId} locale={runtime.locale} onChange={ignore} showItems={false} onSelected={openDialog} disabled={state.phase!=="editing"}/>} stepNavigation={(items.length>0||objects.length>0||state.phase!=="editing")?<Button ref={registerTrigger} type="button" variant="outlined" onClick={openDialog}>{fr?"Reprendre ma demande":"Resume my request"}</Button>:undefined} animation={animation} onSubmit={openDialog} onRecover={runtime.recover} onRestart={runtime.restart}/></div>;
}
