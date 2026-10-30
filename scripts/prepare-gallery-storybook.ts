import {copyFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
const root=resolve(import.meta.dirname,".."),destination=resolve(root,".storybook/public/media");
const plates=[
 "public/demo/gallery/glass-full.png",
 "public/demo/gallery/glass-detail.png",
 "public/demo/gallery/glass-reading.png",
 "public/demo/gallery/glass-catalogue.png",
 "public/demo/gallery/limestone.png",
 "public/demo/gallery/bowl.png",
];
await mkdir(destination,{recursive:true});
const id=(n:number)=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0");
for(const [index,path]of plates.entries())await copyFile(resolve(root,path),resolve(destination,id(501+index)));
for(let index=0;index<7;index++)await copyFile(resolve(root,plates[index%3]!),resolve(destination,id(510+index)));
console.log("Prepared 13 local gallery demo media; native PNG provenance preserved.");

// Local synthetic artwork0817; source files ship with this frontend.
for(const [index,name] of ["main","view-2","view-3"].entries())await copyFile(resolve(root,`public/demo/gallery-mobile/${name}.webp`),resolve(destination,id(601+index)));

for(let index=0;index<10;index++)await copyFile(resolve(root,`public/demo/gallery-mobile/${["main","view-2","view-3"][index%3]}.webp`),resolve(destination,id(620+index)));
