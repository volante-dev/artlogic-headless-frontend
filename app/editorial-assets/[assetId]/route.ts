import {relayResponsiveImage} from "@/lib/media/public-image-http";
import {relayEditorialAsset} from "@/lib/presentation/relay-asset";
export async function GET(request:Request,{params}:{params:Promise<{assetId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).assetId,"editorial",false);return relayEditorialAsset(request,(await params).assetId);}
export async function HEAD(request:Request,{params}:{params:Promise<{assetId:string}>}){if(new URL(request.url).searchParams.has("image"))return relayResponsiveImage(request,(await params).assetId,"editorial",true);return relayEditorialAsset(request,(await params).assetId);}
