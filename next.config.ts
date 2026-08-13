import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // PREVIEW ONLY — Unsplash room-sets stand in until Wall King's own
    // photography is supplied. Remove this block and point `src` at
    // /public/collections once real images land.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
