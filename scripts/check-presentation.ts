import {readFile} from "node:fs/promises";
import ts from "typescript";
import {exportManifests,canonicalJson} from "./export-presentation-manifest.ts";
import {defaultManifest} from "../clients/default/manifest.ts";
import {demoGalleryManifest} from "../clients/demo-gallery/manifest.ts";
const hashes=await exportManifests(true);
const text=await readFile(new URL("../page-composer/registry.ts",import.meta.url),"utf8"),source=ts.createSourceFile("registry.ts",text,ts.ScriptTarget.Latest,true);
let names:string[]=[];
function visit(node:ts.Node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)==="sectionRegistry"&&node.initializer){const value=ts.isSatisfiesExpression(node.initializer)?node.initializer.expression:node.initializer;if(ts.isObjectLiteralExpression(value))names=value.properties.map(p=>p.name?.getText(source).replaceAll('"',"")??"");}ts.forEachChild(node,visit);}
visit(source);
for(const manifest of [defaultManifest,demoGalleryManifest]){if(canonicalJson(names.sort())!==canonicalJson(manifest.sections.map(s=>s.type).sort()))throw new Error("presentation_renderer_registry_mismatch");if(manifest.schemaVersion!==1||manifest.componentContractVersion!==1||!hashes[manifest.profileId])throw new Error("presentation_profile_contract_mismatch");}
console.log("Presentation manifests and all nine section renderers agree for both profiles.");
