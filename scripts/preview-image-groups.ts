/** Isolated review surface, never mounted in the public Next application. */
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createServer} from 'vite';
const root=process.cwd(),directory=resolve(root,'.runtime/image-group-preview');
const port=Number(process.argv.find(arg=>arg.startsWith('--port='))?.slice(7)??54124);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('invalid_preview_port');
await mkdir(directory,{recursive:true});
await writeFile(resolve(directory,'index.html'),'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compositions — Apparitions proposées</title><style>body{margin:0}*{box-sizing:border-box}</style></head><body><div id="root"></div><script type="module" src="/entry.tsx"></script></body></html>');
await writeFile(resolve(directory,'entry.tsx'),"import React from 'react';import {createRoot} from 'react-dom/client';import {ImageGroupMotionPreview} from '../../components/editorial/immersive/ImageGroupMotionPreview';createRoot(document.getElementById('root')!).render(<ImageGroupMotionPreview/>);");
await writeFile(resolve(directory,'Image.tsx'),"import React from 'react';export default function Image({unoptimized:_ignored,...props}:React.ImgHTMLAttributes<HTMLImageElement>&{unoptimized?:boolean}){return <img {...props}/>;}");
const server=await createServer({configFile:false,root:directory,publicDir:resolve(root,'public'),resolve:{alias:{'next/image':resolve(directory,'Image.tsx')}},esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port,strictPort:true,fs:{allow:[root]}}});
await server.listen();console.log('Comparateur local : http://127.0.0.1:'+port+'/');
