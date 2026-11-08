export interface HeroFocus {mediaId:string;x:number;y:number}
export function parseHeroFocus(value:unknown,primaryId:string|undefined):HeroFocus|null {
 if(value===undefined||value===null)return null;
 if(typeof value!=="object"||Array.isArray(value))throw new Error("invalid_gallery_response");
 const v=value as Record<string,unknown>;
 if(Object.keys(v).length!==3||v.mediaId!==primaryId||![v.x,v.y].every(n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=1))throw new Error("invalid_gallery_response");
 return {mediaId:v.mediaId as string,x:v.x as number,y:v.y as number};
}
