import{createElement,type ComponentType}from'react';import{it,expect}from'vitest';import{renderToStaticMarkup}from'react-dom/server';import{ArtworkProgress}from'../../components/artworks/ArtworkProgress';import{ViewProgress}from'../../components/navigation/ViewProgress';import{immersiveMessages}from'../../lib/i18n/editorial-immersive';
it('keeps artwork markup and labels through the neutral progress component',()=>{const html=renderToStaticMarkup(createElement(ArtworkProgress,{count:3,active:1,onSelect:()=>{}}));expect(html).toContain('data-artwork-progress="true"');expect(html.match(/<button/g)).toHaveLength(3);expect(html.match(/aria-current="step"/g)).toHaveLength(1);expect(html).toContain('2 sur 3');expect(renderToStaticMarkup(createElement(ViewProgress,{count:0,active:0,onSelect:()=>{},navigationLabel:'Sections',stepLabel:()=>''}))).toBe('');});
it('resolves a complete local dictionary without mutating the global catalogue',()=>{expect(immersiveMessages('de','en').exit).toBe('Leave the article');expect(immersiveMessages('en','fr').previous).toBe('Previous section');expect(immersiveMessages('de','it').exit).toBe('Quitter la lecture');});

import{ArtworkProgress as LegacyArtworkProgress}from'../fixtures/legacy-artwork-progress';
import{SiteContentProvider}from'../../components/SiteContentProvider';
import{initialMessages}from'../../lib/i18n/messages.generated';
it('preserves the frozen artwork DOM apart from the explicit viewport count variable',()=>{
 for(const locale of ['fr','en'])for(const count of [0,1,3])for(const active of [0,1]){
  const props={count,active,onSelect:()=>{},className:'custom-progress'};
  const render=(View:ComponentType<Parameters<typeof ArtworkProgress>[0]>)=>{
   // React's createElement overload requires this provider's children in its props object.
   // eslint-disable-next-line react/no-children-prop
   return renderToStaticMarkup(createElement(SiteContentProvider,{messages:initialMessages(locale),locale,defaultLocale:'fr',children:createElement(View,props)}));
  };
  const actual=render(ArtworkProgress),countStyle=` style="--view-progress-count:${Math.max(1,count)}"`;
  if(count>0)expect(actual).toContain(countStyle);
  expect(actual.replace(countStyle,"")).toBe(render(LegacyArtworkProgress));
 }
});
