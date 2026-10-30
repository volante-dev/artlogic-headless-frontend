import {relayPreviewAsset} from "@/lib/presentation/relay-asset";
export async function GET(request:Request,{params}:{params:Promise<{assetId:string}>}){return relayPreviewAsset(request,(await params).assetId);}
export const HEAD=GET;
