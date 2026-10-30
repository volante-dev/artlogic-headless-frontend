import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SectionStory} from "../.storybook/SectionStory";
const meta={title:"Sections/Contact",component:SectionStory,args:{type:"contact"},tags:["autodocs"]} satisfies Meta<typeof SectionStory>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Compact:Story={args:{variant:"compact",state:"normal"}};
export const Split:Story={args:{variant:"split",state:"normal"}};
export const Long:Story={args:{variant:"compact",state:"long"}};
export const Empty:Story={args:{variant:"compact",state:"empty"}};
