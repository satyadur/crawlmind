/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ Allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // local dev
        "6n5mmg1r-3000.inc1.devtunnels.ms", // tunnel URL
        "https://crawlmind-htal4u72x-satyas-projects-8ff14e5b.vercel.app", // Vercel prod URL (no trailing slash)
      ],
    },
  },
  webpack: (
    config: Configuration,
    { isServer }: { isServer: boolean }
  ): Configuration => {
    // ✅ Ensure module.rules exists before pushing
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.map$/,
        use: "ignore-loader",
      });
    }

    if (isServer) {
      // ✅ Ensure externals is always an array
      if (!Array.isArray(config.externals)) {
        config.externals = [];
      }
      config.externals.push("chrome-aws-lambda", "puppeteer");
    }

    return config;
  },
};

export default nextConfig;
