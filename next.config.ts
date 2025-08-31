import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ This will allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // local dev
        "6n5mmg1r-3000.inc1.devtunnels.ms", // your tunnel URL
      ],
    },
  },
};

export default nextConfig;
