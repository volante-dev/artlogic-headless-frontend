import {buildImageAttributes,type ImageDescriptor} from '../media/public-image-url';
import type {components} from '../api/generated';
import type {PublicArticle} from './types';
import {articleMetaDescription} from './metadata';
import {safeEditorialHref} from './links';
type Rich=components['schemas']['EditorialRichText'];
type Node=components['schemas']['EditorialRichNode'];
type Media=components['schemas']['EditorialPublicMedia'];
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const link=(href:string,label:string)=>safeEditorialHref(href)?`<a href="${escape(href)}" rel="noreferrer">${label}</a>`:label;
function rich(document:Rich|null):string{
 const node=(n:Node):string=>{if(n.type==='text'){let text=escape(n.text);for(const mark of n.marks??[]){if(mark.type==='bold')text='<strong>'+text+'</strong>';if(mark.type==='italic')text='<em>'+text+'</em>';if(mark.type==='link')text=link(mark.attrs.href,text);}return text;}if(n.type==='hardBreak')return '<br>';const children=(n.content??[]).map(node).join(''),tag=n.type==='heading'?'h'+n.attrs.level:({paragraph:'p',bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote'} as Record<string,string>)[n.type];return tag?`<${tag}>${children}</${tag}>`:children;};
 return document?.content.map(node).join('')??'';
}
type Descriptors=Readonly<Record<string,ImageDescriptor>>;
function imageAttributes(path:string,descriptors:Descriptors){const d=descriptors[path];if(!d)return `src="${escape(path)}"`;const a=buildImageAttributes(d,"min(74ch, 100vw)");return `src="${escape(a.src)}" srcset="${escape(a.srcSet)}" sizes="${escape(a.sizes)}" width="${d.source.width}" height="${d.source.height}"`;}
function media(value:Media,descriptors:Descriptors={}):string{
 const source=value.source;let visual='';
 if(source?.kind==='image'||source?.kind==='artwork'){const img=safeEditorialHref(source.srcPath)&&source.srcPath.startsWith('/')?`<img ${imageAttributes(source.srcPath,descriptors)} alt="${escape(value.alt)}" loading="lazy">`:'';visual=source.kind==='artwork'?link(source.href,img):img;}
 if(source?.kind==='video'&&source.srcPath.startsWith('/')&&safeEditorialHref(source.srcPath))visual=`<video controls preload="none" src="${escape(source.srcPath)}" aria-label="${escape(value.alt)}"></video>`;
 if(source?.kind==='youtube')visual=link('https://www.youtube.com/watch?v='+encodeURIComponent(source.videoId),escape(value.alt));
 if(source?.kind==='vimeo')visual=link('https://vimeo.com/'+encodeURIComponent(source.videoId)+(source.privacyHash?'/'+encodeURIComponent(source.privacyHash):''),escape(value.alt));
 const info=value.artworkInfo.length?'<dl>'+value.artworkInfo.map(item=>`<dt>${escape(item.label)}</dt><dd>${escape(item.value)}</dd>`).join('')+'</dl>':'';
 const cta=value.cta?link(value.cta.href,escape(value.cta.label)):'';
 return `<figure>${visual}<figcaption>${info}${rich(value.subtext)}${cta}</figcaption></figure>`;
}
/** Public projection only. Never accepts draft storage JSON, embeds or author-supplied HTML. */
export function renderNativeEditorialArticle(article:PublicArticle,locale:string,descriptors:Descriptors={}):string{
 const english=locale.startsWith('en'),body=article.blocks.filter(block=>block.type!=="imageGroup"||block.items.length>0).map(block=>'<section>'+(block.type==='form'||block.type==='formImage'?(block.type==='formImage'?media(block.image,descriptors):'')+'<p>'+(english?'This form requires the interactive version.':'Ce formulaire nécessite la version interactive.')+'</p>':block.type==='text'?rich(block.text):block.type==='media'?media(block.media,descriptors):block.type==='textMedia'?rich(block.text)+media(block.media,descriptors)+(block.secondMedia?media(block.secondMedia,descriptors):''):block.type==='imageGroup'?block.items.map(item=>media(item.media,descriptors)).join(''):block.slides.map(slide=>media(slide.media,descriptors)).join(''))+'</section>').join('');
 const cover=article.cover&&article.cover.srcPath.startsWith('/')&&safeEditorialHref(article.cover.srcPath)?`<img ${imageAttributes(article.cover.srcPath,descriptors)} alt="${escape(article.cover.alt)}">`:'';
 const languages=Object.entries(article.alternatePaths).map(([language,path])=>link(path+'?reader=native',escape(language.toUpperCase()))).join(' · ');
 const period=article.exhibitionPeriod?`<p><time>${escape(article.exhibitionPeriod.startsOn)}</time> — <time>${escape(article.exhibitionPeriod.endsOn)}</time></p>`:'';
 const related=article.relatedArticles.length?'<aside><h2>'+(english?'Related articles':'À lire aussi')+'</h2><ul>'+article.relatedArticles.map(item=>'<li>'+link(item.canonicalPath+'?reader=native',escape(item.title))+'</li>').join('')+'</ul></aside>':'';
 return `<!doctype html><html lang="${escape(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(article.title)}</title><meta name="description" content="${escape(articleMetaDescription(article))}"><link rel="canonical" href="${escape(article.canonicalPath)}"><style>html{color-scheme:light}body{margin:0;background:#f6f7f6;color:#101314;font:1.125rem/1.65 system-ui,sans-serif}header,main,footer{max-width:74ch;margin:auto;padding:clamp(20px,5vw,64px)}header{border-bottom:1px solid #64736a}h1{font-size:clamp(2rem,6vw,4rem);line-height:1.1}h1,h2,h3,p,a{overflow-wrap:anywhere}section{margin-block:4rem}figure{margin:2rem 0}img,video{display:block;width:100%;height:auto;max-height:100svh;object-fit:contain}a{color:inherit;text-underline-offset:.2em}a:focus-visible{outline:3px solid #21623f;outline-offset:4px}figcaption{margin-top:1rem}blockquote{border-left:2px solid #64736a;margin-inline:0;padding-left:1.5rem}dt{font-weight:600}dd{margin:0 0 1rem}nav{display:flex;gap:1rem;flex-wrap:wrap}</style></head><body><header><nav aria-label="${english?'Reading navigation':'Navigation de lecture'}">${link(article.canonicalPath,english?'Interactive version':'Version interactive')}${languages}</nav></header><main><article><h1>${escape(article.title)}</h1>${article.summary?'<p>'+escape(article.summary)+'</p>':''}${period}${article.editorialDate?'<time>'+escape(article.editorialDate)+'</time>':''}${article.authors.length?'<p>'+article.authors.map(a=>escape(a.name)).join(', ')+'</p>':''}${article.terms.length?'<p>'+article.terms.map(term=>escape(term.label)).join(' · ')+'</p>':''}${cover}${body}${related}</article></main></body></html>`;
}
