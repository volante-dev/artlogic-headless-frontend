import {PassThrough} from 'node:stream';
import {createElement,Suspense} from 'react';
import {renderToPipeableStream} from 'react-dom/server';
import {expect,it} from 'vitest';
import {HeaderCommerceBoundary} from '../../components/header/HeaderCommerceBoundary';
import type {HeaderCommerceAvailability} from '../../lib/header/navigation-state';

it('streams the main content before secondary links, then renders those links when available',async()=>{
 let resolve!:(value:HeaderCommerceAvailability)=>void;
 const availability=new Promise<HeaderCommerceAvailability>(done=>{resolve=done;}),output=new PassThrough();
 let html='',shellReady!:()=>void,ended!:()=>void;
 const shell=new Promise<void>(done=>{shellReady=done;}),finished=new Promise<void>(done=>{ended=done;});
 output.on('data',chunk=>{html+=String(chunk);if(html.includes('Main content'))shellReady();});output.on('end',ended);
 const stream=renderToPipeableStream(createElement('html',null,createElement('body',null,
  createElement('main',null,'Main content'),
  createElement(Suspense,{fallback:null},createElement(HeaderCommerceBoundary,{availability,render:value=>value.storeAvailable?createElement('a',{href:'/store'},'Store'):null})),
 )),{onShellReady(){stream.pipe(output);},onError(error){throw error;}});
 try{
  await shell;expect(html).toContain('Main content');expect(html).not.toContain('href="/store"');
  resolve({storeAvailable:true,storeTrackingAvailable:true});await finished;expect(html).toContain('href="/store"');
 }finally{stream.abort();output.destroy();}
});
