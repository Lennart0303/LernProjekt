import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  basePath: "/essensrad",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
