"use client";
import type {components} from "@/lib/api/generated";
import {PublicForm} from "@/sections/Form";
import {MediaBlock} from "./MediaBlock";
import styles from "./FormBlock.module.css";
type Block=Extract<components["schemas"]["EditorialPublicBlock"],{type:"form"|"formImage"}>;
export function FormBlock({block,immersive=false,active=true}:{block:Block;immersive?:boolean;active?:boolean}){
 return <section id={block.id} data-editorial-form className={`${styles.root} ${block.type==="formImage"?styles.split:""} ${block.type==="formImage"&&block.imageSide==="right"?styles.right:""} ${immersive?styles.immersive:""}`}>
  {block.type==="formImage"&&<div className={styles.image} data-editorial-motion-media><MediaBlock media={block.image} active={active} allowZoom={false}/></div>}
  <div className={styles.fields}><PublicForm formId={block.formId} blockId={block.id} hideTitle={block.hideTitle} animation={immersive?false:block.immersiveAnimation}/></div>
 </section>;
}
