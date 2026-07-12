import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (and its pdfjs-dist dependency) relies on Node-specific module
  // resolution for its worker/legacy build. Webpack-bundling it breaks that
  // resolution in serverless environments — keep it external so Next uses
  // native `require()` instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
