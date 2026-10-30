import {relayPublicAsset} from "@/lib/presentation/relay-asset";
export async function GET(request:Request,{params}:{params:Promise<{assetId:string}>}){return relayPublicAsset(request,(await params).assetId);}
export async function HEAD(request:Request,{params}:{params:Promise<{assetId:string}>}){return relayPublicAsset(request,(await params).assetId);}
