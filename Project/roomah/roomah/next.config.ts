import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ffscwhmqwwnxukwimpsd.supabase.co", // ganti dgn host projectmu
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
