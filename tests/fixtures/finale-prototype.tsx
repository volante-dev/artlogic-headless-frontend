import React,{useCallback,useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {ArtworkFinale} from "../../components/artworks/ArtworkFinale";
import {ArtworkFinaleMedia,type FinalePhoto} from "../../components/artworks/ArtworkFinaleMedia";
import {useArtworkFinale} from "../../components/artworks/useArtworkFinale";
import sceneStyles from "../../components/artworks/ArtworkFinale.module.css";
import "./finale-prototype.css";
const dimensions=[[1586,992],[1254,1254],[1086,1448],[1122,1402],[1254,1254]];
const imageNames=["glass-full","glass-detail","glass-reading","limestone","bowl"];
const allPhotos:FinalePhoto[]=imageNames.map((name,i)=>({id:name,src:"/assets/"+name+".png",width:dimensions[i][0],height:dimensions[i][1],alt:"Photographie synthétique de démonstration "+(i+1)}));
function Prototype(){
 const root=useRef<HTMLDivElement>(null),reading=useRef<HTMLDivElement>(null),[count,setCount]=useState(5),[long,setLong]=useState(false),[reduced,setReduced]=useState(false),[mobile,setMobile]=useState(false),[locale,setLocale]=useState("fr"),[closed,setClosed]=useState(false);
 const [active,setActive]=useState(false),[settled,setSettled]=useState(false),[selected,setSelected]=useState(4);
 const photos=useMemo(()=>Array.from({length:Math.min(count,selected+1)},(_,i)=>allPhotos[selected-i]),[count,selected]);
 const pendingPhoto=useRef<number|null>(null);
 const onSettled=useCallback((finale:boolean)=>{setSettled(finale);if(!finale&&pendingPhoto.current!==null){setSelected(pendingPhoto.current);pendingPhoto.current=null;}},[]);
 const motion=useArtworkFinale(root,photos,{reduced,enabled:!closed,onSettled}),go=useCallback((value:boolean)=>{setActive(value);motion.go(value);},[motion]);
 const target=useRef(false);useEffect(()=>{target.current=active;},[active]);const direction=useRef(0),lastWheel=useRef(0);
 useEffect(()=>{const query=matchMedia("(prefers-reduced-motion: reduce)"),change=()=>setReduced(query.matches);change();query.addEventListener("change",change);return ()=>query.removeEventListener("change",change);},[]);
 useEffect(()=>{const element=root.current;if(!element)return;const wheel=(event:WheelEvent)=>{
  if(event.ctrlKey||Math.abs(event.deltaY)<5)return;
  const panel=reading.current;if(target.current&&panel?.dataset.scrollable==="true"&&(panel.contains(event.target as Node)||panel.contains(document.activeElement)))return;
  event.preventDefault();const now=performance.now(),next=Math.sign(event.deltaY);if(now-lastWheel.current<260&&next===direction.current)return;direction.current=next;lastWheel.current=now;go(next>0);
 };element.addEventListener("wheel",wheel,{passive:false});return ()=>element.removeEventListener("wheel",wheel);},[go]);
 const touch=useRef<{x:number;y:number}|null>(null);
 const title=locale==="fr"?"Étude de volumes":"A study of volumes";
 return <div className="review">
  <div className="reviewbar"><span>Prototype animé · données synthétiques</span><div>
   <label>Photos <select aria-label="Nombre de photos" value={count} onChange={e=>{go(false);setCount(+e.target.value);setSelected(Math.max(0,+e.target.value-1));}}>{[0,1,2,5].map(n=><option key={n}>{n}</option>)}</select></label>
   <button aria-pressed={mobile} onClick={()=>setMobile(v=>!v)}>Mobile</button><button aria-pressed={long} onClick={()=>setLong(v=>!v)}>Texte long</button><button aria-pressed={reduced} onClick={()=>setReduced(v=>!v)}>Mouvement réduit</button>
  </div></div>
  <div className="review-canvas" data-mobile={mobile}>
  {closed?<div className="closed"><p>La scène est fermée.</p><button onClick={()=>{setClosed(false);setActive(false);setSettled(false);}}>Rouvrir le prototype</button></div>:<div ref={root} className={sceneStyles.scene} data-prototype-scene data-target={active?"finale":"photo"} data-settled={settled} tabIndex={0}
   onKeyDown={event=>{if(["ArrowDown","ArrowRight","End"].includes(event.key)){event.preventDefault();go(true);}if(["ArrowUp","ArrowLeft","Home"].includes(event.key)){event.preventDefault();go(false);}if(event.key==="Escape"){pendingPhoto.current=null;go(false);setClosed(true);}}}
   onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}}
   onTouchEnd={e=>{if(!touch.current)return;const dy=e.changedTouches[0].clientY-touch.current.y,dx=e.changedTouches[0].clientX-touch.current.x;touch.current=null;if(Math.abs(dy)>60&&Math.abs(dy)>Math.abs(dx)&&!(reading.current?.dataset.scrollable==="true"&&reading.current.contains(e.target as Node)))go(dy<0);}}>
   <div className={sceneStyles.black} data-finale-black/>
   <div className={sceneStyles.camera} data-finale-camera>{photos.toReversed().map((photo,i)=><ArtworkFinaleMedia key={photo.id} photo={photo} front={i===photos.length-1}/>)}</div>
   <div className="entry-frame" data-finale-start-frame aria-hidden="true"/>
   <ArtworkFinale title={title} active={active} readingRef={reading} provenanceLabel={locale==="fr"?"Provenance":"Provenance"} metadata={<div>{locale==="fr"?"Dossier de démonstration":"Demonstration dossier"}</div>} previousDetails={<dl><div><dt>{locale==="fr"?"Année":"Year"}</dt><dd>2026</dd></div><div><dt>{locale==="fr"?"Technique":"Medium"}</dt><dd>{locale==="fr"?"Étude photographique synthétique":"Synthetic photographic study"}</dd></div><div><dt>Dimensions</dt><dd>{locale==="fr"?"Données de démonstration":"Demonstration data"}</dd></div></dl>} provenance={<p>{locale==="fr"?"Collection de démonstration":"Demonstration collection"}<br/>{locale==="fr"?"Corpus photographique synthétique — aucun historique réel":"Synthetic photographic corpus — no actual history"}</p>} contact={<button aria-disabled="true" onClick={()=>{}}>{locale==="fr"?"Demander des informations":"Request information"}</button>}>
    {(locale==="fr"?[
     "La lumière dessine une ligne, révèle une épaisseur, traverse la matière. Le regard passe d’une silhouette à un détail, puis retrouve l’équilibre de l’ensemble.",
     "Ce dossier synthétique réunit plusieurs études photographiques pour évaluer le mouvement et la lecture. Il ne constitue ni une attribution, ni une provenance d’œuvre réelle.",
    ]:["Light traces a line, reveals an edge and passes through the material. The eye moves from a silhouette to a detail, then returns to the balance of the whole.","This synthetic dossier brings together photographic studies to evaluate movement and reading. It is neither an attribution nor the history of an actual artwork."]).concat(long?Array(16).fill(locale==="fr"?"Le détail invite à prolonger le regard. Cette séquence permet de vérifier qu’un long texte reste lisible sans imposer un changement de scène pendant la lecture.":"The detail invites a closer look. This passage verifies that a long text remains readable without changing the scene while reading."):[]).map((text,i)=><p key={i}>{text}</p>)}
   </ArtworkFinale>
   <div className="modal-controls"><div><button onClick={()=>setLocale("fr")} aria-pressed={locale==="fr"}>FR</button><button onClick={()=>setLocale("en")} aria-pressed={locale==="en"}>EN</button></div><button className="close" aria-label="Fermer" onClick={()=>{pendingPhoto.current=null;go(false);setClosed(true);}}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
   <nav className="timeline" aria-label="Progression">{Array.from({length:count||1},(_,i)=><button key={i} aria-label={count?`Photo ${i+1}`:"Informations"} aria-current={!active&&i===selected?"step":undefined} onClick={()=>{pendingPhoto.current=i;go(false);}}><span/></button>)}<button aria-label="Conclusion" aria-current={active?"step":undefined} onClick={()=>go(true)}><span/></button></nav>
   <span className="announcement" aria-live="polite">{active?"Conclusion":"Photographie"}</span>
  </div>}
  </div>
 </div>;
}
createRoot(document.getElementById("root")!).render(<Prototype/>);
