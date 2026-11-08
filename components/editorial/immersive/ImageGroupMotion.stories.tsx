import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {ImageGroupMotionPreview} from './ImageGroupMotionPreview';
const meta={title:'Editorial/Image groups/Proposed appearances',component:ImageGroupMotionPreview,parameters:{layout:'fullscreen'}} satisfies Meta<typeof ImageGroupMotionPreview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Comparator:Story={};
