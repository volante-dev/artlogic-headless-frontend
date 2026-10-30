"use client";
import {Typography} from "../ui/Typography";
import {Button} from "../ui/Button";
import {useSiteContent} from "../SiteContentProvider";
import type {PublicContactArtwork as Context} from "../../lib/contact/types";
export function ContactArtworkContext({artwork,unavailable,onGeneral}:{artwork:Context|null;unavailable:boolean;onGeneral:()=>void}){const {messages:m}=useSiteContent();return <><Typography variant="h2">{m["contact.artworkHeading"]}</Typography>{!unavailable&&artwork?<><p>{artwork.title}</p><a href={artwork.url}>{m["contact.backArtwork"]}</a></>:<><p>{m["contact.artworkUnavailable"]}</p><Button variant="text" onClick={onGeneral}>{m["contact.general"]}</Button></>}</>;}
