import type{PresentationAsset}from'../presentation/types';
import{physicalImageDescriptor}from'./public-image-descriptor';
/** Default image fields can be ambiguous about the selected persisted variant.
 * Only take the no-request fast path when a physical variant path identifies it.
 */
export function presentationImageDescriptor(asset?:PresentationAsset|null){
 if(!asset||asset.kind!=='image'||!asset.width||!asset.height)return;
 const variant=new URL(asset.path,'https://application.invalid').searchParams.get('variant');
 if(!variant)return; // Authoritative batch resolves the full source, not a guessed upload size.
 const candidates=[{variant,width:asset.width,height:asset.height},...(asset.variants??[])].sort((a,b)=>b.width-a.width||b.height-a.height||a.variant.localeCompare(b.variant)),best=candidates[0]!;
 return physicalImageDescriptor({resourceKind:'presentation',resourceId:asset.id},{width:best.width,height:best.height,mimeType:asset.mimeType,...(best.variant===variant?{byteSize:asset.byteSize}:{})},asset.id+'.'+best.variant);
}
