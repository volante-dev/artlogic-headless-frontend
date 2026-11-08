import {relayResponsiveImage} from "@/lib/media/public-image-http";
import {relayPublicAsset} from "@/lib/presentation/relay-asset";
export async function GET(request:Request,{params}:{params:Promise<{assetId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).assetId,"presentation",false);return relayPublicAsset(request,(await params).assetId);}
export async function HEAD(request:Request,{params}:{params:Promise<{assetId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).assetId,"presentation",true);return relayPublicAsset(request,(await params).assetId);}
