import type { NextConfig } from "next";

// GitHub Pages: statik export + proje alt-yolu (/samsung-tv-playground)
const isProd = process.env.NODE_ENV === "production";
const base = isProd ? "/samsung-tv-playground" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: base,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: base },
  images: { unoptimized: true },
};

export default nextConfig;
