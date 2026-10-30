import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The isolated browser harness can coexist with the developer's local server.
  distDir: process.env.E2E_GALLERY_BUILD==="1"?".runtime/next-gallery-production":process.env.DEPLOYMENT_ENV === "test" && process.env.NODE_ENV === "development" ? ".runtime/next-public-"+(/^[0-9a-f-]{36}$/i.test(process.env.SITE_ID??"")?process.env.SITE_ID:"preview") : ".next",
  cacheComponents: true,
  typescript:{tsconfigPath:process.env.E2E_GALLERY_BUILD==="1"?"tsconfig.gallery.json":"tsconfig.json"},
  experimental: {globalNotFound:true},
  partialPrefetching: true,
  // Preserve Flight headers in the visibility guard so its 404 is not rewritten.
  skipProxyUrlNormalize: true,
  async headers(){return [{source:"/((?!_next/static).*)",headers:[...(process.env.DEPLOYMENT_ENV==="test"?[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]:[]),{key:"Cache-Control",value:"private, no-store"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"no-referrer"}]},{source:"/preview/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"},{key:"Content-Security-Policy",value:"frame-ancestors 'self'"}]}];},
};

export default nextConfig;
