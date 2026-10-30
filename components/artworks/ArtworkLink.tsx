"use client";
import {FreshLink} from "../FreshLink";
/** A real anchor: new tabs, no-JS visits and modified clicks keep their native behavior. */
export function ArtworkLink(props:React.ComponentProps<typeof FreshLink>){return <FreshLink {...props}/>;}
