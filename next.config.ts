import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // pdf-parse pulls in @napi-rs/canvas; bundling it often breaks on Vercel — keep as Node externals
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas", "pdfjs-dist"],
}

export default nextConfig
