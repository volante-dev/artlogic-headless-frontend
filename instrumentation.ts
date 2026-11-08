import type {Instrumentation} from 'next';
import {diagnosticId} from './lib/presentation/diagnostics';
/** Capture streamed render failures too: their document may already carry HTTP 200. */
export const onRequestError:Instrumentation.onRequestError=(error,request,context)=>{
 const e=error as {digest?:unknown;code?:unknown;message?:unknown}|null;
 const known=new Set(['presentation_unavailable','presentation_configuration_mismatch','invalid_response','service_unavailable','invalid_page_context','presentation_release_changed']);
 console.error(JSON.stringify({event:'public_render_failed',renderId:diagnosticId(request.headers['x-vercel-id']),digest:diagnosticId(e?.digest),code:known.has(String(e?.message))?e?.message:'render_error',route:context.routePath,routeType:context.routeType}));
};
