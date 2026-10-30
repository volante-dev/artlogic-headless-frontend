import {relayContact} from "@/lib/contact/server";
export async function POST(request:Request){return relayContact(request,"inquiries");}
