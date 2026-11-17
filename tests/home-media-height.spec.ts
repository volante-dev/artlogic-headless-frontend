import {expect,test} from "@playwright/test";

for(const viewport of [{width:375,height:812},{width:667,height:375},{width:1440,height:900}]){
 test(`home media preserves readable information at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("/");await page.getByRole("button",{name:"Compris",exact:true}).focus();await page.keyboard.press("Enter");
  const hero=page.getByTestId("hero-media").filter({visible:true});await expect(hero).toBeVisible();
  const geometry=await page.evaluate(()=>{
   const probe=document.createElement("div");probe.style.height="100lvh";document.body.append(probe);
   const large=probe.getBoundingClientRect().height;probe.style.height="100svh";const small=probe.getBoundingClientRect().height;probe.remove();
   const hero=document.querySelector<HTMLElement>('[data-testid="hero-media"]')!,box=hero.getBoundingClientRect();
   const discover=hero.querySelector("a")!.getBoundingClientRect(),button=hero.querySelector("button")!.getBoundingClientRect();
   const selection=document.querySelector("[data-selection-viewport]")!,selectionBox=selection.getBoundingClientRect();
   const caption=selection.querySelector("[data-artwork-caption]")!.getBoundingClientRect();
   return {large,small,heroHeight:box.height,discover:{top:discover.top-box.top,bottom:discover.bottom-box.top},button:{top:button.top-box.top,bottom:button.bottom-box.top},selectionHeight:selectionBox.height,captionTop:caption.top-selectionBox.top,progressBottom:selection.lastElementChild!.getBoundingClientRect().bottom-selectionBox.top,captionBottom:caption.bottom-selectionBox.top};
  });
  expect(geometry.heroHeight).toBeCloseTo(geometry.large,0);
  expect(geometry.discover.top).toBeGreaterThan(0);expect(geometry.button.top).toBeGreaterThan(0);
  expect(geometry.discover.bottom).toBeLessThanOrEqual(geometry.small-23);
  expect(geometry.button.bottom).toBeLessThanOrEqual(geometry.small-23);
  await hero.screenshot({path:test.info().outputPath("hero.png")});
  if(viewport.width<768){
   expect(geometry.selectionHeight).toBeCloseTo(geometry.large,0);
   expect(geometry.captionTop-geometry.progressBottom).toBeGreaterThanOrEqual(12);
   expect(geometry.captionBottom).toBeLessThanOrEqual(geometry.small-24);
   const selection=page.locator("[data-selection-viewport]").first();
   await selection.screenshot({path:test.info().outputPath("selection.png")});
  }
 });
}

test("expanded browser toolbars leave captions and playback controls inside the visible area",async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto("/");await page.getByRole("button",{name:"Compris",exact:true}).focus();await page.keyboard.press("Enter");
 await expect(page.getByTestId("hero-media").filter({visible:true})).toBeVisible();
 // Headless browsers have no collapsing toolbars. Resolve the real CSS against
 // fixed large/small bounds and two dynamic heights to exercise that geometry.
 const states=await page.evaluate(()=>{
  const declarations:{style:CSSStyleDeclaration;original:string}[]=[];
  function visit(rules:CSSRuleList){for(const rule of rules){if(rule instanceof CSSStyleRule&&/\d(?:lvh|svh|dvh)\b/.test(rule.style.cssText))declarations.push({style:rule.style,original:rule.style.cssText});if("cssRules" in rule)visit((rule as CSSGroupingRule).cssRules);}}
  for(const sheet of document.styleSheets)visit(sheet.cssRules);
  const large=812,small=660;
  return [small,large].map(dynamic=>{
   for(const {style,original} of declarations)style.cssText=original.replace(/(\d*\.?\d+)(lvh|svh|dvh)\b/g,(_,amount,unit)=>`${Number(amount)*({lvh:large,svh:small,dvh:dynamic}[unit as "lvh"|"svh"|"dvh"])/100}px`);
   const hero=document.querySelector('[data-testid="hero-media"]')!,selection=document.querySelector("[data-selection-viewport]")!;
   const h=hero.getBoundingClientRect(),s=selection.getBoundingClientRect(),caption=selection.querySelector("[data-artwork-caption]")!.getBoundingClientRect();
   return {hero:h.height,selection:s.height,discover:hero.querySelector("a")!.getBoundingClientRect().bottom-h.top,playback:hero.querySelector("button")!.getBoundingClientRect().bottom-h.top,captionTop:caption.top-s.top,caption:caption.bottom-s.top,progress:selection.lastElementChild!.getBoundingClientRect().bottom-s.top};
  });
 });
 const first=states[0]!;expect(first).toEqual(states[1]);
 expect(first.hero).toBe(812);expect(first.selection).toBe(812);
 expect(first.discover).toBeLessThanOrEqual(636);expect(first.playback).toBeLessThanOrEqual(636);
 expect(first.captionTop-first.progress).toBeGreaterThanOrEqual(12);expect(first.caption).toBeLessThanOrEqual(604);expect(first.progress).toBeLessThanOrEqual(636);
});
