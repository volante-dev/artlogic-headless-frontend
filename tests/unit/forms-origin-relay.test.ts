import {it,expect,vi,beforeEach} from "vitest";
const state=vi.hoisted(()=>({policyHeaders:vi.fn(),config:{role:"F",FORMS_ENABLED:"true",SITE_ORIGIN:"https://gallery.example.test",SITE_ALLOWED_ORIGINS_JSON:["https://preview.gallery.example.test","https://gallery.vercel.app"],CONTACT_SERVICE_KEY:"synthetic-service-key",BACKEND_URL:"https://api.example.test",REQUEST_TIMEOUT_MS:1000} as Record<string,unknown>}));
vi.mock("server-only",()=>({}));
vi.mock("../../lib/i18n/admission-language",()=>({admissionLanguageHeaders:state.policyHeaders}));
vi.mock("../../lib/config/env",()=>({loadConfig:()=>state.config,stringValue:(c:Record<string,unknown>,k:string)=>c[k],numberValue:(c:Record<string,unknown>,k:string)=>c[k],listValue:(c:Record<string,unknown>,k:string)=>c[k]}));
vi.mock("../../lib/contact/network-context",()=>({visitorIp:()=>"192.0.2.10"}));
// This suite verifies transport provenance; executable payload schemas have their own contract suite.
vi.mock("../../lib/forms/contracts",()=>({validFormContract:()=>true}));
import {relayForms} from "../../lib/forms/server";
const id="30000000-0000-4000-8000-000000000001";
beforeEach(()=>{vi.unstubAllGlobals();state.policyHeaders.mockReset().mockResolvedValue({'X-Site-Language-Contract':'1','X-Site-Language-Revision':'8'});});
it.each(["https://gallery.example.test","https://preview.gallery.example.test","https://gallery.vercel.app"])("relays sessions from %s with canonical backend provenance",async origin=>{
 const upstream=vi.fn().mockResolvedValue(Response.json({accepted:true},{status:201}));vi.stubGlobal("fetch",upstream);
 const result=await relayForms(new Request(origin+"/api/forms/"+id+"/sessions",{method:"POST",headers:{origin,"sec-fetch-site":"same-origin","content-type":"application/json"},body:JSON.stringify({locale:"fr",placement:{ownerType:"page",ownerId:"contact",blockId:id}})}),[id,"sessions"]);
 expect(result.status).toBe(201);expect(upstream).toHaveBeenCalledOnce();
 const [url,options]=upstream.mock.calls[0]!;expect(url).toBe("https://api.example.test/v1/internal/forms/"+id+"/sessions");
 expect(options.headers.get("X-Site-Language-Revision")).toBe("8");expect(options.headers.get("X-Site-Language-Contract")).toBe("1");expect(options.headers.get("X-Contact-Origin")).toBe(state.config.SITE_ORIGIN);expect(options.headers.get("X-Contact-Visitor-IP")).toBe("192.0.2.10");
});
it("refuses untrusted origins before any upstream call",async()=>{
 const upstream=vi.fn();vi.stubGlobal("fetch",upstream);
 for(const origin of ["https://evil.example.test","null"]){const result=await relayForms(new Request("https://gallery.vercel.app/api/forms/"+id+"/sessions",{method:"POST",headers:{origin,"content-type":"application/json"},body:"{}"}),[id,"sessions"]);expect(result.status).toBe(403);}
 expect(upstream).not.toHaveBeenCalled();
});

it("returns a revision conflict without replaying a session admission",async()=>{
 const upstream=vi.fn().mockResolvedValue(Response.json({error:{code:'language_policy_changed'}},{status:409}));vi.stubGlobal('fetch',upstream);
 const origin=String(state.config.SITE_ORIGIN),response=await relayForms(new Request(origin+'/api/forms/'+id+'/sessions',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({locale:'it'})}),[id,'sessions']);
 expect(response.status).toBe(409);expect((await response.json()).error.code).toBe('language_policy_changed');expect(upstream).toHaveBeenCalledOnce();
});
it("keeps an admitted historical session independent of current language policy",async()=>{
 state.policyHeaders.mockRejectedValue(Error('current policy unavailable'));const upstream=vi.fn().mockResolvedValue(Response.json({session:'historical'}));vi.stubGlobal('fetch',upstream);
 const origin=String(state.config.SITE_ORIGIN),response=await relayForms(new Request(origin+'/api/forms/sessions/'+id,{headers:{origin,'x-form-capability':'a'.repeat(43)}}),['sessions',id]);
 expect(response.status).toBe(200);expect(state.policyHeaders).not.toHaveBeenCalled();expect(upstream.mock.calls[0]![1].headers.get('X-Site-Language-Revision')).toBeNull();
});
