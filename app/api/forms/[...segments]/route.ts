import {relayForms} from "@/lib/forms/server";
type Context={params:Promise<{segments:string[]}>};
export async function GET(request:Request,context:Context){return relayForms(request,(await context.params).segments);}
export async function POST(request:Request,context:Context){return relayForms(request,(await context.params).segments);}
export async function DELETE(request:Request,context:Context){return relayForms(request,(await context.params).segments);}
