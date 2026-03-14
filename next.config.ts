import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),

  // Configuration for @xenova/transformers with webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },

  // Externalize packages that shouldn't be bundled
  serverExternalPackages: ['@xenova/transformers'],
};

export default nextConfig;
