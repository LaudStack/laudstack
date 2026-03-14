import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "ehnlovnzpfvaxwwmgppj.supabase.co" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "d2xsxph8kpxj0f.cloudfront.net" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "t2.gstatic.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "icons.duckduckgo.com" },
      { protocol: "https", hostname: "dev-to-uploads.s3.amazonaws.com" },
      { protocol: "https", hostname: "api.microlink.io" },
      { protocol: "https", hostname: "files.manuscdn.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // Prevent next/document from being bundled so it uses the same
      // instance as the Pages Router runtime (avoids Html context mismatch)
      const existing = config.externals || [];
      const externalsArray = Array.isArray(existing) ? existing : [existing];
      config.externals = [
        ...externalsArray,
        ({ request }: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (request === "next/document" || request?.startsWith("next/dist/pages/_document")) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
