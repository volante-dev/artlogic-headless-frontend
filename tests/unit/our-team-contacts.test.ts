import {it,expect} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {teamEmailHref,teamPhoneHref} from "../../lib/presentation/team-contacts";
import {TeamContacts} from "../../sections/TeamContacts";
it("creates exact safe contact actions for all four independent combinations",()=>{
 const email='A+B#C@example.org';expect(decodeURIComponent(teamEmailHref(email)!.slice(7))).toBe(email);expect(teamPhoneHref('+33 (0)1 42 00 00 00')).toBe('tel:+330142000000');expect(teamEmailHref('a@example.org\n')).toBeUndefined();expect(teamPhoneHref('javascript:123456')).toBeUndefined();
 for(const [mail,phone,n] of [[undefined,undefined,0],['contact@example.org',undefined,1],[undefined,'01 42 00 00 00',1],['contact@example.org','01 42 00 00 00',2]] as const){const html=renderToStaticMarkup(createElement(TeamContacts,{name:'王 Exemple',email:mail,phone}));expect(html.match(/<a\b/g)?.length??0).toBe(n);if(!n)expect(html).toBe('');else expect(html).toContain('王 Exemple');}
});
