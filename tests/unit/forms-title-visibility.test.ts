import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe,it,expect} from "vitest";
import {FormView,type FormViewProps} from "../../components/forms/FormView";
import {isFormTitleHidden} from "../../lib/forms/definition.generated";
const props:FormViewProps={phase:"editing",locale:"fr",title:"Titre du formulaire",intro:"Une introduction conservée",animation:false,body:createElement("label",null,"Votre message",createElement("input",{name:"message"})),onSubmit(){},onRecover(){},onRestart(){}};
describe("per-placement form heading",()=>{
 it("honors either the versioned form toggle or the placement while keeping legacy titles visible",()=>{for(const hideTitle of [undefined,false,true])for(const placement of [false,true]){const hidden=isFormTitleHidden({hideTitle},placement),html=renderToStaticMarkup(createElement(FormView,{...props,hideTitle:hidden}));expect(html.includes('>Titre du formulaire</h2>')).toBe(!hidden);expect(html).toContain('aria-label="Titre du formulaire"');expect(html).toContain("Une introduction conservée");expect(html).toContain("Votre message");}});
 it("shows the title by default and hides only its heading when requested",()=>{const visible=renderToStaticMarkup(createElement(FormView,props)),hidden=renderToStaticMarkup(createElement(FormView,{...props,hideTitle:true}));expect(visible).toMatch(/<h2[^>]*>Titre du formulaire<\/h2>/);expect(hidden).not.toMatch(/<h2/);expect(hidden).toContain('aria-label="Titre du formulaire"');expect(hidden).toContain("Une introduction conservée");expect(hidden).toContain("Votre message");});
 it("keeps receipt feedback visible even when the placement heading is hidden",()=>{const result=renderToStaticMarkup(createElement(FormView,{...props,hideTitle:true,phase:"accepted",successMessage:"Votre demande a été reçue.",reference:"FORM-SYNTHETIC"}));expect(result).toContain("Votre demande a été reçue.");expect(result).toContain("FORM-SYNTHETIC");});
});
