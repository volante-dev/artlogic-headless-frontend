import {it,expect} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {OurTeam} from "../../sections/OurTeam";
import type {TeamSection} from "../../lib/presentation/team-types";
const person=(n:number)=>({id:`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`,firstName:`Prénom ${n}`,lastName:"Exemple",photo:{id:'11111111-1111-4111-8111-111111111111',kind:'image' as const,path:'/v1/public/presentation-assets/11111111-1111-4111-8111-111111111111?variant=w640',mimeType:'image/webp' as const,byteSize:100,width:640,height:800},focalPoint:{x:.5,y:.5}});
it("renders founders first exactly once with no empty groups or fictitious people",()=>{
 for(const count of [0,1,2,4]){const section:TeamSection={id:'team',title:'Notre équipe',afterSectionId:null,founders:Array.from({length:count},(_,i)=>person(i+1)),members:Array.from({length:30-count},(_,i)=>person(i+count+1))};const html=renderToStaticMarkup(createElement(OurTeam,{section}));expect(html.match(/data-team-person=/g)).toHaveLength(30);if(count){expect(html.indexOf('Prénom 1')).toBeLessThan(html.indexOf(`Prénom ${count+1}`));expect(html).toContain('Fondateurs');}else expect(html).not.toContain('Fondateurs');}
 expect(renderToStaticMarkup(createElement(OurTeam,{section:{id:'team',title:'Notre équipe',afterSectionId:null,founders:[],members:[]}}))).toBe('');
});
