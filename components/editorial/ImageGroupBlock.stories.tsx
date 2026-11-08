import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {ImageGroupBlock} from './ImageGroupBlock';
import {imageGroupBlock as group} from "../../.storybook/image-group-fixtures";

const meta={title:'Editorial/Image groups/Blocks',component:ImageGroupBlock,args:{block:group('diptych')},parameters:{layout:'fullscreen'}} satisfies Meta<typeof ImageGroupBlock>;
export default meta;type Story=StoryObj<typeof meta>;
export const Diptych:Story={};
export const Triptych:Story={args:{block:group('triptych')}};
export const SingleSurvivor:Story={args:{block:{...group('triptych'),items:group('triptych').items.slice(0,1)}}};
export const NoSurvivors:Story={args:{block:{...group('diptych'),items:[]}}};
export const DiptychReveal:Story={args:{block:{...group('diptych'),immersiveAnimation:'group-reveal'}}};
export const DiptychZoomOut:Story={args:{block:{...group('diptych'),immersiveAnimation:'group-zoom-out'}}};
export const TriptychReveal:Story={args:{block:{...group('triptych'),immersiveAnimation:'group-reveal'}}};
export const TriptychZoomOut:Story={args:{block:{...group('triptych'),immersiveAnimation:'group-zoom-out'}}};
