import type { NextConfig } from "next";
import {readFileSync} from "node:fs";
const fontCatalog=JSON.parse(readFileSync(new URL("./public/fonts/catalog.json",import.meta.url),"utf8")) as {fonts:{faces:{path:string;sha256:string}[]}[]};

const nextConfig: NextConfig = {
  // The isolated browser harness can coexist with the developer's local server.
  distDir: process.env.E2E_GALLERY_BUILD==="1"?(/^\.runtime\/next-gallery-[a-z0-9-]+$/.test(process.env.E2E_GALLERY_DIST_DIR??"")?process.env.E2E_GALLERY_DIST_DIR:".runtime/next-gallery-production"):process.env.DEPLOYMENT_ENV === "test" && process.env.NODE_ENV === "development" ? ".runtime/next-public-"+(/^[0-9a-f-]{36}$/i.test(process.env.SITE_ID??"")?process.env.SITE_ID:"preview") : ".next",
  cacheComponents: true,
  typescript:{tsconfigPath:process.env.E2E_GALLERY_BUILD==="1"?"tsconfig.gallery.json":"tsconfig.json"},
  experimental: {globalNotFound:true},
  partialPrefetching: true,
  // Preserve Flight headers in the visibility guard so its 404 is not rewritten.
  skipProxyUrlNormalize: true,
  async headers(){return [{source:"/((?!_next/static|fonts/).*)",headers:[...(process.env.DEPLOYMENT_ENV==="test"?[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]:[]),{key:"Cache-Control",value:"private, no-store"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"no-referrer"}]},...fontCatalog.fonts.flatMap(font=>font.faces.map(face=>({source:face.path,headers:[{key:"Cache-Control",value:"public, max-age=0, must-revalidate"}]}))),...fontCatalog.fonts.flatMap(font=>font.faces.map(face=>({source:face.path,has:[{type:"query" as const,key:"v",value:face.sha256.slice(0,16)}],headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]}))),{source:"/preview/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]}];},
};

export default nextConfig;
