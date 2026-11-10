import {test,expect} from "@playwright/test";
import {openMobile} from "./gallery-mobile-helpers";
test("shared frost expands horizontally before rising and protects the shell",async({page})=>{
 const scene=await openMobile(page),panel=scene.locator('[data-mobile-information-panel]'),title=scene.locator('[data-artwork-title]').first(),image=scene.locator('[data-active="true"] img').first();
 const heading=await title.elementHandle(),photo=await image.elementHandle();
 await scene.getByRole("button",{name:"Voir les informations",exact:true}).click();
 await expect(page.locator('[data-artwork-dialog-controls]')).toHaveAttribute("inert","");
 await expect(panel).toHaveAttribute('data-information-phase','reading');
 expect(await heading!.evaluate(n=>n.isConnected)).toBe(true);expect(await photo!.evaluate(n=>n.isConnected)).toBe(true);
 const surface=panel.locator('[data-artwork-frost-surface]');expect(await surface.evaluate(n=>getComputedStyle(n).backdropFilter)).toContain('blur');
 await expect(panel.locator('[data-information-border]')).toHaveCount(4);
 await expect(page.locator('[data-artwork-dialog-controls]')).toHaveCSS('opacity','0');
 await scene.getByRole('button',{name:'Revenir aux images',exact:true}).click();
 await expect(scene).toHaveAttribute('data-mobile-mode','gallery');await expect(page.locator('[data-artwork-dialog-controls]')).not.toHaveAttribute('inert', '');
});
test("custom focal crop and zoom pan stay stable behind information",async({page})=>{
 const scene=await openMobile(page),frame=scene.getByTestId('artwork-frame'),image=frame.locator('[data-active="true"] img');
 const position=await image.evaluate(n=>getComputedStyle(n).objectPosition);
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();
 expect(await image.evaluate(n=>getComputedStyle(n).objectPosition)).toBe(position);
 await scene.getByRole('button',{name:'Revenir aux images',exact:true}).click();await expect(scene).toHaveAttribute('data-mobile-mode','gallery');
 await scene.getByRole('button',{name:'Agrandir l’image ×2',exact:true}).click();await frame.focus();await page.keyboard.press('ArrowRight');
 const transform=await image.evaluate(n=>getComputedStyle(n).transform);
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();
 expect(await image.evaluate(n=>getComputedStyle(n).transform)).toBe(transform);
 await expect(scene.locator('[data-mobile-information-panel]')).toHaveAttribute('data-information-phase','reading');
 expect(await image.evaluate(n=>getComputedStyle(n).transform)).toBe(transform);
});


test("image zoom fades before the shell as the frosted plane expands",async({page})=>{
 const scene=await openMobile(page);await scene.evaluate(n=>{const samples:{opacity:number;shell:number}[]=[];Reflect.set(window,'zoomFadeSamples',samples);const started=performance.now(),tick=()=>{const zoom=n.querySelector<HTMLElement>('[data-mobile-image-controls]')!,shell=document.querySelector<HTMLElement>('[data-artwork-dialog-controls]')!;samples.push({opacity:parseFloat(getComputedStyle(zoom).opacity),shell:parseFloat(getComputedStyle(shell).opacity)});if(performance.now()-started<2400)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 const controls=scene.locator('[data-mobile-image-controls]'),panel=scene.locator('[data-mobile-information-panel]');
 // The approved composition puts the frosted panel above image controls; verify the actual shared fade below.
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();await expect(panel).toHaveAttribute('data-information-ready','true');
 const samples=await page.evaluate(()=>Reflect.get(window,'zoomFadeSamples') as {opacity:number;shell:number}[]);expect(samples.some(s=>s.opacity>.05&&s.opacity<.95)).toBe(true);expect(samples.some(s=>s.shell>.05&&s.shell<.95)).toBe(true);expect(samples.findIndex(s=>s.opacity<.95)).toBeLessThan(samples.findIndex(s=>s.shell<.95));await expect(controls).toHaveCSS('opacity','0');
});
