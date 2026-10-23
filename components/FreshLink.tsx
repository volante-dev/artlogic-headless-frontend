"use client";
import Link from "next/link";
/** Each document visit rechecks publication. Modifier-key navigation stays native. */
export function FreshLink({href,children,className}:{href:string;children:React.ReactNode;className?:string}){
  return <Link href={href} prefetch={false} className={className} onNavigate={event=>{event.preventDefault();window.location.assign(href);}}>{children}</Link>;
}
