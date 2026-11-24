/** Mirrors the Ratton photo surface. Shared by preload, native HTML and the carousel. */
export function rattonArtworkImageSizes(ratio:number){
 const safe=Number.isFinite(ratio)&&ratio>0?ratio:1;
 const mobile=`min(calc(100vw - 32px), calc(40svh * ${safe}))`;
 return `(max-width: 959px) ${mobile}, (max-height: 639px) ${mobile}, min(calc(64vw - 48px), calc((100svh - 48px) * ${safe}))`;
}

/** Full-height examination uses responsive sizes, never an automatic HD reference. */
export function rattonArtworkExpandedImageSizes(ratio:number){const safe=Number.isFinite(ratio)&&ratio>0?ratio:1;return `min(100vw, calc((100dvh - 184px) * ${safe}))`;}
