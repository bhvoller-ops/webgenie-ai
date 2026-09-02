import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  // launch-kit/ is real content (member-facing SOPs, /playbooks) that must
  // ship in the Vercel serverless bundle — without this it's repo-only and
  // 404s in production even though it works in dev (files are read off
  // disk at request time, not bundled by the Next.js compiler by default).
  outputFileTracingIncludes: {
    "/playbooks/**": ["./launch-kit/**"],
    "/api/playbooks/**": ["./launch-kit/**"]
  },
  // jsdom (isomorphic-dompurify's server-side implementation, used to
  // sanitize rendered playbook markdown) ships non-JS assets (e.g.
  // browser/default-stylesheet.css) that webpack's bundler can't resolve
  // correctly when bundled into the server build — confirmed live, a
  // production build fails with ENOENT for that exact file otherwise.
  // Marking it external makes Next load it from node_modules at runtime
  // instead of bundling it.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"]
};

export default nextConfig;
