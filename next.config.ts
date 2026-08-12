import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {
    root: __dirname,
  },

  serverExternalPackages: ["mindee"],
};

export default nextConfig;
