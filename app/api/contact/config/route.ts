import {connection} from "next/server";
import {contactConfigResponse} from "@/lib/contact/server";
export async function GET(){await connection();return contactConfigResponse();}
