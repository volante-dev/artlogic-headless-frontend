'use client';
import {SiteLoading} from '../SiteLoading';
export function EditorialListLoading({kind}:{kind:'publication'|'news'|'exhibition'}){return <SiteLoading testId={`editorial-${kind}-loading`}/>;}
