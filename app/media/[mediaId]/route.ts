import {relayResponsiveImage} from "@/lib/media/public-image-http";
import {relayPublicMedia} from "@/lib/media/relay-public-media";
export async function GET(request:Request,{params}:{params:Promise<{mediaId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).mediaId,"artwork",false);return relayPublicMedia(request,(await params).mediaId,"artwork");}
export async function HEAD(request:Request,{params}:{params:Promise<{mediaId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).mediaId,"artwork",true);return relayPublicMedia(request,(await params).mediaId,"artwork",true);}
