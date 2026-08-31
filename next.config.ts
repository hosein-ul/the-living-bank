import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "127.0.0.1", "localhost"],
};

export default nextConfig;
