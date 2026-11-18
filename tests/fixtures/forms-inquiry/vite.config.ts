import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),source=fileURLToPath(new URL('../../../',import.meta.url));
export default defineConfig({root,resolve:{alias:{'@':source}},esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:6011,strictPort:true,fs:{allow:[source]}}});
