'use client';
import {useCallback} from 'react';
import {useSiteContent} from '../../components/SiteContentProvider';
import {runtimeText,type RuntimeMessageId} from './site-messages';
export function useRuntimeText(requestedLocale?:string){const {messages,locale}=useSiteContent();return useCallback((id:RuntimeMessageId,parameters:Readonly<Record<string,unknown>>={})=>runtimeText(messages,requestedLocale??locale,id,parameters),[messages,locale,requestedLocale]);}
