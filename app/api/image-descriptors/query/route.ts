import{imageBridge}from'@/lib/media/public-image-bridge';
export async function POST(request:Request){return imageBridge(request,'descriptors');}
