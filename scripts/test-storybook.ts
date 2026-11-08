import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {spawn} from "node:child_process";
const root=resolve(import.meta.dirname,".."),staticRoot=resolve(root,process.env.STORYBOOK_BUILD_DIR??"storybook-static");
await stat(resolve(staticRoot,"index.json"));
const types:Record<string,string>={".html":"text/html",".js":"application/javascript",".mjs":"application/javascript",".css":"text/css",".json":"application/json",".woff2":"font/woff2",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".mp4":"video/mp4",".ico":"image/x-icon"};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url??"/","http://localhost"),path=resolve(staticRoot,"."+decodeURIComponent(url.pathname==="/"?"/index.html":url.pathname));
    if(!path.startsWith(staticRoot+sep)){res.writeHead(403).end();return;}
    const bytes=await readFile(path),type=types[extname(path)]??(bytes.subarray(1,4).toString()==="PNG"?"image/png":bytes.subarray(8,12).toString()==="WEBP"?"image/webp":bytes.subarray(4,8).toString()==="ftyp"?"video/mp4":"application/octet-stream");
    res.setHeader("Content-Type",type);res.setHeader("Cache-Control","no-store");res.setHeader("Accept-Ranges","bytes");
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=Number(range[1]),end=Math.min(Number(range[2]||bytes.length-1),bytes.length-1);if(start>end){res.writeHead(416,{"Content-Range":`bytes */${bytes.length}`}).end();return;}res.writeHead(206,{"Content-Range":`bytes ${start}-${end}/${bytes.length}`,"Content-Length":end-start+1});res.end(req.method==="HEAD"?undefined:bytes.subarray(start,end+1));return;}
    res.writeHead(200,{"Content-Length":bytes.length});res.end(req.method==="HEAD"?undefined:bytes);
  }catch{res.writeHead(404).end();}
});
await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
try{
  const address=server.address();if(!address||typeof address==="string")throw new Error("storybook_server_failed");
  const child=spawn(process.execPath,["node_modules/@playwright/test/cli.js","test","--config","playwright.storybook.config.ts",...process.argv.slice(2)],{cwd:root,stdio:"inherit",env:{...process.env,STORYBOOK_TEST_ORIGIN:`http://127.0.0.1:${address.port}`}});
  const code=await new Promise<number|null>((resolve,reject)=>{child.once("error",reject);child.once("exit",resolve);});if(code!==0)process.exitCode=code??1;
}finally{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
