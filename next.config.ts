import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const pagesBasePath = isGitHubPages
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/INMOB").replace(/\/$/, "")
  : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: pagesBasePath,
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: isGitHubPages,
  },
};

export default nextConfig;
