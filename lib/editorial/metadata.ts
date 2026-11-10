import type {components} from '../api/generated';
import type {PublicArticle} from './types';
type RichNode=components['schemas']['EditorialRichNode'];
const normalize=(value:string|null|undefined)=>value?.replace(/\s+/gu,' ').trim()??'';
function text(node:RichNode):string{
 if(node.type==='text')return node.text;
 if(node.type==='hardBreak')return ' ';
 return (node.content??[]).map(text).join(node.type==='paragraph'||node.type==='heading'?'':' ');
}
/** Uses only published, localized text. Authored summaries retain priority. */
export function articleMetaDescription(article:PublicArticle,siteDescription='',siteName=''):string{
 const summary=normalize(article.summary);if(summary)return summary;
 const body=normalize(article.blocks.flatMap(block=>block.type==='text'||block.type==='textMedia'?block.text.content.map(text):[]).join(' '));
 if(body){const chars=Array.from(body);if(chars.length<=160)return body;const prefix=chars.slice(0,157).join('');const boundary=prefix.lastIndexOf(' ');return (boundary>100?prefix.slice(0,boundary):prefix).trimEnd()+'…';}
 return normalize(siteDescription)||[normalize(article.title),normalize(siteName)].filter(Boolean).join(' — ');
}
