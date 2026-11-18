import {createRoot} from 'react-dom/client';
import {useFormContext} from 'react-hook-form';
import {FormSessionProvider,useFormSession} from '../../../components/forms/FormSessionProvider';
import type {FormRuntimeValues} from '../../../lib/forms/resolver';
const artworkId=new URLSearchParams(location.search).get('artwork')==='b'?'90000000-0000-4000-8000-000000000002':'90000000-0000-4000-8000-000000000001';
function Fields(){const {register}=useFormContext<FormRuntimeValues>(),runtime=useFormSession();if(runtime.entry.status!=='ready')return null;const state=runtime.entry.state;return <form onSubmit={e=>{e.preventDefault();runtime.submit();}}>{state.session.document.fields.map(field=><label key={field.id}>{field.translations.fr!.label}<input {...register(`answers.${field.id}`)}/></label>)}<button type="submit">Envoyer</button></form>;}
function Probe(){const runtime=useFormSession();return runtime.entry.status==='ready'&&runtime.entry.state.phase==='accepted'?<p role="status">Demande reçue</p>:runtime.entry.status==='ready'?<Fields/>:<p role="status">{runtime.entry.status}</p>;}
createRoot(document.getElementById('root')!).render(<FormSessionProvider formId="90000000-0000-4000-8000-000000000010" locale="fr" placement={{ownerType:'page',ownerId:'contact',artworkId}} inquiryArtwork={{title:artworkId.endsWith('2')?'Objet B':'Objet A',artist:'Démonstration'}}><Probe/></FormSessionProvider>);
