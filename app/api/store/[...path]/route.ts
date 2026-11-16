import type {NextRequest} from "next/server";
import {relayCommerce} from "@/lib/commerce/server";
async function handle(request:NextRequest,context:{params:Promise<{path:string[]}>}){return relayCommerce(request,(await context.params).path);}
export {handle as GET,handle as POST};
