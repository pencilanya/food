import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@food/domain", "@food/ui"],
};

export default nextConfig;
