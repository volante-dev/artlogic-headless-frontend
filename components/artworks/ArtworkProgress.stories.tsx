import {useState} from "react";
import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {ArtworkProgress} from "./ArtworkProgress";
import styles from "./ArtworkExperience.module.css";
function ProgressStory({count=3,paper=false}:{count?:number;paper?:boolean}){
  const [active,setActive]=useState(0);
  return <article className={styles.experience} data-rail-tone={paper?"paper":"image"} style={{minHeight:"100svh",background:paper?"var(--site-color-background)":"var(--site-color-inverseSurface)"}}><ArtworkProgress count={count} active={active} onSelect={setActive}/></article>;
}
const meta={title:"Gallery/ArtworkProgress",component:ProgressStory,tags:["autodocs"]} satisfies Meta<typeof ProgressStory>;
export default meta;type Story=StoryObj<typeof meta>;
export const OnImage:Story={};
export const OnPaper:Story={args:{paper:true}};
export const OneView:Story={args:{count:1}};
export const WithoutImage:Story={args:{count:0}};
export const ManyViews:Story={args:{count:7}};
