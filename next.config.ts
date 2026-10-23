import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Preserve Flight headers in the visibility guard so its 404 is not rewritten.
  skipProxyUrlNormalize: true,
  async headers(){return [{source:"/((?!_next/static).*)",headers:[{key:"Cache-Control",value:"private, no-store"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"no-referrer"}]}];},
};

export default nextConfig;
