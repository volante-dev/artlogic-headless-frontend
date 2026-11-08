import {relayResponsiveImage} from "@/lib/media/public-image-http";
import {relayPublicMedia} from "@/lib/media/relay-public-media";
export async function GET(request:Request,{params}:{params:Promise<{logoId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).logoId,"siteLogo",false);return relayPublicMedia(request,(await params).logoId,"siteLogo");}
export async function HEAD(request:Request,{params}:{params:Promise<{logoId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).logoId,"siteLogo",true);return relayPublicMedia(request,(await params).logoId,"siteLogo",true);}
