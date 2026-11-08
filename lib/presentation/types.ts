import type {components} from "../api/generated";
export type PublicPresentation=components["schemas"]["PresentationPublic"];
export type PresentationTheme=components["schemas"]["PresentationTheme"];
export type PresentationAsset=components["schemas"]["PresentationPublicAsset"];
export type PresentationSection=components["schemas"]["ResolvedPresentationSection"];
export type PageKey=components["schemas"]["PresentationPageKey"];
export type PresentationLink=components["schemas"]["ResolvedPresentationLink"];
export const pageKeys=["home","news","artworks","exhibitions","publications","expertise","contact","artworkDetail","galerist"] as const satisfies readonly PageKey[];
export function publicAssetPath(path:string):string{
  if(!/^\/v1\/public\/presentation-assets\/[0-9a-f-]{36}(?:\?variant=(?:original|w640|w1280|w1920))?$/.test(path))throw new Error("invalid_asset_path");
  return path.replace("/v1/public/presentation-assets/","/presentation-assets/");
}
export function presentationAssetPath(path:string,scope:"public"|"preview"):string{
  if(scope==="public")return publicAssetPath(path);
  if(!/^\/v1\/preview\/assets\/[0-9a-f-]{36}(?:\?variant=(?:original|w640|w1280|w1920))?$/.test(path))throw new Error("invalid_asset_path");
  return path.replace("/v1/preview/assets/","/preview/assets/");
}

export type ResolvedFooter=components["schemas"]["PresentationFooterResolved"];
