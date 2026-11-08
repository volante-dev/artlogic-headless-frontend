'use client';
import Image from 'next/image';
import {useRef,useState} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {createImageGroupAppearance,imageGroupMotionProposals} from './image-group-motion';
import styles from './ImageGroupMotionPreview.module.css';
gsap.registerPlugin(useGSAP);
export function ImageGroupMotionPreview(){
 const host=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null);
 const [format,setFormat]=useState<'diptych'|'triptych'>('diptych'),[option,setOption]=useState(0),[mobile,setMobile]=useState(false),[reduced,setReduced]=useState(false),[cycle,setCycle]=useState(0),[slide,setSlide]=useState(0);
 useGSAP(()=>{if(!surface.current)return;createImageGroupAppearance(imageGroupMotionProposals[option]!.id,surface.current,reduced).play();},{scope:host,dependencies:[format,option,mobile,reduced,cycle],revertOnUpdate:true});
 const count=format==='diptych'?2:3,images=['glass-full.png','glass-detail.png','glass-reading.png'];
 return <div ref={host} className={styles.comparator}><header className={styles.settings}><h1>Deux et trois regards</h1><p>Apparitions proposées — contenus fictifs.</p><div className={styles.choices}><label>Composition<select value={format} onChange={e=>{setFormat(e.target.value as typeof format);setSlide(0);}}><option value="diptych">Deux images</option><option value="triptych">Trois images</option></select></label><label>Apparition<select value={option} onChange={e=>setOption(Number(e.target.value))}>{imageGroupMotionProposals.map((a,i)=><option value={i} key={a.id}>{a.label} · {a.durationMs} ms</option>)}</select></label><label><input type="checkbox" checked={mobile} onChange={e=>setMobile(e.target.checked)}/> Format mobile</label><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Mouvement réduit</label><button type="button" onClick={()=>setCycle(c=>c+1)}>Rejouer</button></div></header>
 <div className={styles.frame} data-mobile={mobile||undefined}><div className={styles.siteHeader}><span>GALERIE</span><span>FR / EN</span></div><div ref={surface} className={styles.surface} style={{gridTemplateColumns:mobile?'1fr':`repeat(${count},minmax(0,1fr))`}}>
 {Array.from({length:mobile?1:count},(_,i)=><figure className={styles.mask} key={i}><div data-group-motion-frame className={styles.canvas}><Image unoptimized src={'/demo/gallery/'+images[mobile?slide:i]} alt="Étude fictive en verre fumé" width={1536} height={1024}/><figcaption data-editorial-motion-controls>{['Présence','Matière','Lumière'][mobile?slide:i]}</figcaption></div></figure>)}
 {mobile&&<nav className={styles.navigation} data-editorial-motion-controls aria-label="Images"><button type="button" aria-label="Image précédente" onClick={()=>setSlide(s=>(s+count-1)%count)}>←</button><div>{Array.from({length:count},(_,i)=><button type="button" key={i} aria-label={'Image '+(i+1)} aria-current={i===slide?'true':undefined} onClick={()=>setSlide(i)}><span/></button>)}</div><button type="button" aria-label="Image suivante" onClick={()=>setSlide(s=>(s+1)%count)}>→</button></nav>}
 </div></div></div>;
}
