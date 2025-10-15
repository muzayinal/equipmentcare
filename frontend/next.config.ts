import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Other config options can go here
  
  // Customize webpack configuration
  webpack(config) {
    // Add a rule to handle SVG files using @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"], // Use SVGR to import SVG as React components
    });

    return config;
  },
};

export default nextConfig;
