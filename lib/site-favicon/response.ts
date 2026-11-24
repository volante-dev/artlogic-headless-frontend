import {fallbackFavicons} from './fallback.generated';
type Dependencies={backendUrl:string;allowedOrigins:readonly string[];mock:boolean;fetch:typeof fetch;signal?:AbortSignal;warn:(event:Record<string,unknown>)=>void};
export const faviconFiles=['favicon.ico','icon-32.png','icon-192.png','icon-512.png','apple-touch-icon.png'] as const;
const cache=(seconds:number)=>({'Cache-Control':`public, max-age=${seconds}, s-maxage=${seconds}`,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
export async function faviconResponse(request:Request,o:Dependencies){
 const query=new URL(request.url).searchParams,name=query.get('file')??'favicon.ico';
 if([...query.keys()].some(key=>key!=='file')||query.getAll('file').length>1||!faviconFiles.includes(name as typeof faviconFiles[number]))return new Response(null,{status:404});
 const file=name as typeof faviconFiles[number];
 let fallbackSeconds=300;
 try{
  const response=await o.fetch(o.backendUrl.replace(/\/$/,'')+'/v1/public/site-favicon?file='+encodeURIComponent(file),{headers:{Accept:'application/json'},redirect:'manual',cache:'no-store',signal:AbortSignal.any([AbortSignal.timeout(2000),...(o.signal?[o.signal]:[])])});
  await response.body?.cancel();
  if(response.status===307){
   const url=new URL(response.headers.get('location')??'');
   if(!o.allowedOrigins.includes(url.origin)||url.username||url.password||url.hash||!url.pathname.startsWith('/storage/v1/object/sign/')||!url.searchParams.get('token')||url.protocol!=='https:'&&!(o.mock&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('invalid_delivery_url');
   return new Response(null,{status:307,headers:{...cache(300),Location:url.href}});
  }
  if(response.status!==404)throw Error('favicon_unavailable');
 }catch{fallbackSeconds=30;o.warn({event:'site_favicon_fallback',reason:'dependency_unavailable'});}
 const fallback=fallbackFavicons[file];return new Response(new Uint8Array(Buffer.from(fallback.base64,'base64')),{headers:{...cache(fallbackSeconds),'Content-Type':fallback.mime}});
}
