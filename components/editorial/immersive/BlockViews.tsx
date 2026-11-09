'use client';
import {FormBlock} from '../FormBlock';
import {TextMediaGallery} from '../TextMediaGallery';
import {ImageGroupBlock} from '../ImageGroupBlock';
import styles from './ImmersiveArticleReader.module.css';
import type{PublicBlock,ViewContext}from'../../../lib/editorial/immersive/types';import{RichText}from'../RichText';import{MediaBlock}from'../MediaBlock';import{TextMediaBlock}from'../TextMediaBlock';import{CarouselBlock}from'../CarouselBlock';
export function ImmersiveBlockView({block,context}:{block:PublicBlock;context:ViewContext}){const active=context.active&&!context.suspended;
 if(block.type==='form'||block.type==='formImage')return <FormBlock block={block} immersive active={active}/>;
 if(block.type==='text')return <div data-editorial-motion-text><RichText document={block.text}/></div>;
 if(block.type==='media')return <div className={styles.mediaFrame} data-editorial-motion-media><div className={styles.motionContent} data-editorial-motion-content><MediaBlock allowZoom={false} media={block.media} active={active} timeoutMs={10000} preload={context.warming} preparing={context.preparing}/></div></div>;
 if(block.type==='carousel')return <div className={styles.mediaFrame} data-editorial-motion-media><div className={styles.motionContent} data-editorial-motion-content><CarouselBlock preloadAdjacent allowZoom={false} block={block} active={active} timeoutMs={10000} preload={context.warming} preparing={context.preparing}/></div></div>;
 if(block.type==='imageGroup')return <div className={styles.mediaFrame}><ImageGroupBlock immersive block={block} active={active} preload={context.warming} preparing={context.preparing} allowZoom={false}/></div>;
 if(context.panel==='text')return <div data-editorial-motion-text><RichText document={block.text}/></div>;
 if(context.panel==='media')return <div className={styles.mediaFrame} data-editorial-motion-media><div className={styles.motionContent} data-editorial-motion-content><TextMediaGallery immersive allowZoom={false} block={block} active={active} timeoutMs={10000} preload={context.warming} preparing={context.preparing}/></div></div>;
 return <div className={styles.splitFrame}><TextMediaBlock immersive allowZoom={false} block={block} active={active} timeoutMs={10000} preload={context.warming} preparing={context.preparing}/></div>;
}
