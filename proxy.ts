import {NextResponse,type NextRequest} from "next/server";
import {getArtwork} from "./lib/api/artworks";
import {PublicApiError,privateHeaders} from "./lib/api/client";

// A streamed notFound() cannot change headers already sent. Check public visibility
// before starting the document; the page and media still perform their own reads.
export async function proxy(request:NextRequest){
  const id=request.nextUrl.pathname.split("/")[2]??"";
  try{await getArtwork(id);}
  catch(error){
    if(error instanceof PublicApiError&&error.status===404){
      // Next can normalize a rewritten Flight response to 200. A hidden resource
      // has no Flight payload to deliver; terminate that request before rewriting.
      if(request.headers.get("rsc")==="1")return NextResponse.json({error:{code:"not_found"}},{status:404,headers:privateHeaders});
      const target=new URL("/_not-found",request.url);target.search="";
      return NextResponse.rewrite(target,{status:404,headers:privateHeaders});
    }
    // The page error boundary presents a retryable error, never stale content.
  }
  return NextResponse.next({headers:privateHeaders});
}
export const config={matcher:"/artworks/:artworkId"};
