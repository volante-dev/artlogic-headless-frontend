import type{components}from'../../api/generated';import{motionFamilies,type AnimationId}from'./motion-catalog';
export type Article=Omit<components['schemas']['EditorialPreviewArticle'],'diagnostics'>;
export type Block=components['schemas']['EditorialPublicBlock'];
export type EditorialView={id:string;kind:'opening';animationId:AnimationId}|{id:string;kind:'related';animationId:AnimationId}|{id:string;kind:'block';block:Block;panel?:'text'|'media';animationId:AnimationId};
export function buildEditorialViews(article:Article,layout:'mobile'|'desktop'):EditorialView[]{
 const views:EditorialView[]=[{id:'article:'+article.id+':opening',kind:'opening',animationId:article.cover?'media-fade':'text-fade'}];
 for(const block of article.blocks){
  if(block.type==='media'&&!block.media.source&&!block.media.subtext)continue;
  if(block.type==='carousel'&&!block.slides.some(slide=>slide.media.source!==null))continue;
  if(block.type==='imageGroup'&&!block.items.length)continue;
  const animationId=block.immersiveAnimation??motionFamilies[block.type].default;
  if(block.type==='textMedia'&&(block.layout==='successive'||layout==='mobile'&&Boolean(block.secondMedia))){
   const mediaFirst=layout==='mobile'?block.mobileMediaOrder==='before':block.desktopMediaSide==='left';
   for(const panel of mediaFirst?['media','text']as const:['text','media']as const)views.push({id:'block:'+block.id+':'+panel,kind:'block',block,panel,animationId});
  }else views.push({id:'block:'+block.id,kind:'block',block,animationId});
 }
 if(article.relatedArticles.length)views.push({id:'article:'+article.id+':related',kind:'related',animationId:'text-fade'});
 return views;
}
export function reconcileEditorialView(previous:EditorialView|undefined,views:readonly EditorialView[],previousIndex=0){
 if(previous){const exact=views.find(v=>v.id===previous.id);if(exact)return exact.id;if(previous.kind==='block'){const same=views.find(v=>v.kind==='block'&&v.block.id===previous.block.id);if(same)return same.id;}}
 return views[Math.min(Math.max(0,previousIndex),views.length-1)]?.id??null;
}
export function viewImagePaths(view:EditorialView,article:Article,layout:"mobile"|"desktop"="desktop",activeItemId?:string|null):string[]{
 if(view.kind==='opening')return article.cover?[article.cover.srcPath]:[];
 if(view.kind!=='block'||view.panel==='text')return[];
 const block=view.block;if(block.type==='imageGroup'){if(layout==='desktop')return block.items.map(item=>item.media.source.srcPath);const index=Math.max(0,block.items.findIndex(item=>item.id===activeItemId));return (block.items.length>1?[block.items[index]!,block.items[(index+1)%block.items.length]!]:block.items).map(item=>item.media.source.srcPath);}
 if(block.type==='textMedia')return [block.media,block.secondMedia].flatMap(media=>{const source=media?.source;return source&&(source.kind==='image'||source.kind==='artwork')?[source.srcPath]:[];});
 const media=block.type==='formImage'?block.image:block.type==='media'?block.media:block.type==='carousel'?block.slides[0]?.media:null;
 const source=media?.source;return source&&(source.kind==='image'||source.kind==='artwork')?[source.srcPath]:[];
}
