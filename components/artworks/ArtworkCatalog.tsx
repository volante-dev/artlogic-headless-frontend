"use client";
import {ArtworkTypeFilters} from "./ArtworkTypeFilters";
import {useArtworkTypeFilters} from "./useArtworkTypeFilters";
import {squareImageSizes} from "@/lib/media/public-image-sizes";
import {useId,type CSSProperties,type ComponentType} from "react";
import type {CatalogData} from "../../sections/types";
import {useSiteContent} from "../SiteContentProvider";
import {ArtworkCard,type ArtworkCardProps} from "../ArtworkCard";
import {Typography} from "../ui/Typography";
import {IconButton} from "../ui/IconButton";
import {TextField} from "../ui/TextField";
import {FreshLink} from "../FreshLink";
import {localizedPath} from "../../lib/i18n/routes";
import {catalogQueryString} from "../../lib/artworks/catalog-query";
import styles from "./ArtworkCatalog.module.css";
import cards from "../Artwork.module.css";

export interface ArtworkCatalogProps {catalog:CatalogData;columns?:number;id?:string;CardView?:ComponentType<ArtworkCardProps>;ListView?:ComponentType<CatalogListProps>}
export interface CatalogListProps {items:ArtworkCardProps["art"][];columns:number;CardView:ComponentType<ArtworkCardProps>}
export function CatalogList({items,columns,CardView}:CatalogListProps){return <ul className={cards.grid} style={{"--catalog-columns":columns} as CSSProperties}>{items.map((art,index)=><CardView key={art.id} art={art} imageSizes={squareImageSizes((art.media[0]?.width??1)/(art.media[0]?.height??1),columns,art.catalogLarge===true)} eager={index<columns}/>)}</ul>;}
/** Replaceable view. Query validation and public reads stay on the server. */
export function ArtworkCatalog({catalog,columns=3,id,CardView=ArtworkCard,ListView=CatalogList}:ArtworkCatalogProps){
  const {messages:m,locale,defaultLocale}=useSiteContent(),path=localizedPath("/artworks",locale,defaultLocale);
  const numbered=catalog.kind==="numbered"?catalog.page:null,legacy=catalog.kind==="legacy"?catalog.page:null;
  const q=numbered?.query??(catalog.kind==="error"?catalog.q:"");
  const pageSize=numbered?.pageSize??(catalog.kind==="error"?catalog.pageSize:20);
  const filterId=useId(),formId=filterId+"-search",types=numbered?.typeFilters?.selectedIds??(catalog.kind==="error"?catalog.types:[])??[];
  const filters=useArtworkTypeFilters(path,q,pageSize,types);
  const first=path+catalogQueryString({q:q||undefined,pageSize,types:filters.selected});
  const link=(page:number)=>path+catalogQueryString({q:q||undefined,types:filters.selected,page,pageSize,catalogRevision:numbered?.catalogRevision});
  const pages=numbered?paginationWindow(numbered.page,numbered.pageCount):[];
  const items=numbered?.items??legacy?.items??[];
  const restart=catalog.kind==="error"&&["catalog_changed","page_out_of_range","invalid_request"].includes(catalog.code);
  return <section id={id} className={styles.catalog} data-gallery-state={catalog.kind}>
    <ArtworkTypeFilters id={filterId} formId={formId} data={numbered?.typeFilters??(catalog.kind==="legacy"?catalog.typeFilters:undefined)} selected={filters.selected} onToggle={filters.toggle} onClear={()=>filters.change([])} toolbar={trigger=><div className={styles.heading}>
      <Typography variant="h1">{m["page.artworks.title"]}</Typography>
      <form id={formId} action={path} method="get" className={styles.search} role="search" aria-label={m["gallery.searchLabel"]}>
        {trigger}
        <TextField key={q} name="q" type="search" label={m["gallery.searchLabel"]} defaultValue={q} slotProps={{htmlInput:{maxLength:320}}}/>
        <input type="hidden" name="pageSize" value={pageSize}/>
        <IconButton type="submit" className={styles.searchSubmit} aria-label={m["gallery.searchSubmit"]}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="10.75" cy="10.75" r="6.75" stroke="currentColor" strokeWidth="1.5"/><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></IconButton>
      </form>
    </div>}/>
    <span className={styles.resultStatus} role="status">{filters.pending?m["catalog.loading"]:numbered?`${numbered.totalItems}`:""}</span>
    {q&&<FreshLink className={styles.clear} href={path+catalogQueryString({pageSize,types:filters.selected})}>{m["gallery.searchClear"]}</FreshLink>}
    {catalog.kind==="error"?<div className={styles.state} role="status">
      <Typography variant="h2">{restart?m["catalog.unavailableTitle"]:m["catalog.errorTitle"]}</Typography>
      <Typography>{m["catalog.errorMessage"]}</Typography>
      <FreshLink className={styles.action} href={first}>{m[restart?"gallery.restart":"catalog.retry"]}</FreshLink>
    </div>:<>
      {legacy&&<FreshLink className={styles.clear} href={first}>{m["gallery.restart"]}</FreshLink>}
      {items.length?<ListView items={items} columns={columns} CardView={CardView}/>:<Typography role="status" className={styles.state}>{m[q||filters.selected.length?"gallery.noResults":"catalog.empty"]}</Typography>}
      {numbered&&numbered.pageCount>0&&<nav className={styles.pagination} aria-label={m["gallery.paginationLabel"]}>
        {numbered.page>1&&<FreshLink className={styles.page} href={link(numbered.page-1)} aria-label={m["gallery.previousPage"]}><Arrow previous/></FreshLink>}
        {pages.map((page,index)=>page===null?<span key={"gap"+index} className={styles.gap} aria-hidden="true">…</span>:<FreshLink key={page} className={styles.page} href={link(page)} aria-label={m["gallery.page"]+" "+page} aria-current={numbered.page===page?"page":undefined}>{page}</FreshLink>)}
        {numbered.page<numbered.pageCount&&<FreshLink className={styles.page} href={link(numbered.page+1)} aria-label={m["gallery.nextPage"]}><Arrow/></FreshLink>}
        <Typography variant="caption" className={styles.pageStatus}>{m["gallery.page"]} {numbered.page} {m["gallery.of"]} {numbered.pageCount}</Typography>
      </nav>}
      {legacy?.nextCursor&&<FreshLink className={styles.action} href={path+"?cursor="+encodeURIComponent(legacy.nextCursor)}>{m["catalog.next"]}</FreshLink>}
    </>}
  </section>;
}
function Arrow({previous=false}:{previous?:boolean}){return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" style={previous?{transform:"rotate(180deg)"}:undefined}><path d="M3 12h17m-6-6 6 6-6 6"/></svg>;}
export function paginationWindow(page:number,count:number):(number|null)[]{
  const selected=new Set([1,count,page-1,page,page+1].filter(n=>n>=1&&n<=count)),result:(number|null)[]=[];
  for(const n of [...selected].sort((a,b)=>a-b)){const last=result.at(-1);if(typeof last==="number"&&n-last>1)result.push(n-last===2?last+1:null);result.push(n);}return result;
}
