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
  // Samples/Gallery consolidation (owner product decision): /samples is
  // gone as a distinct product area -- Gallery is the only user-facing
  // examples destination now. A config-level redirect (not a page-level
  // permanentRedirect()) is deliberate: it's resolved by Next's routing
  // layer before any page/auth code runs, so an old bookmark can never hit
  // a login check, can never carry an arbitrary query string through (a
  // plain source/destination pair drops the query string entirely, unlike
  // a `:path*` capture), and can't cross origins (the destination is a
  // relative path). `permanent: true` is Next's documented convention for
  // exactly this "old route folded into a new one" case -- it emits a 308,
  // not the 307 an ordinary redirect() call would.
  async redirects() {
    return [{ source: "/samples", destination: "/gallery", permanent: true }];
  },
  // jsdom (used directly by lib/capture/ for the audit engine, NOT by
  // playbooks anymore — that switched to sanitize-html, which has no jsdom
  // dependency at all, see lib/playbooks/content.ts) ships non-JS assets
  // (e.g. browser/default-stylesheet.css) that webpack's bundler can't
  // resolve correctly when bundled into the server build — confirmed live,
  // a production build fails with ENOENT for that exact file otherwise.
  // Marking it external makes Next load it from node_modules at runtime
  // instead of bundling it. isomorphic-dompurify was removed from this list
  // (and from the project) 3 Sep — its own *nested* jsdom copy pulled in an
  // ESM-only dependency that failed a different way once externalized
  // (`ERR_REQUIRE_ESM` in Vercel's production runtime specifically, not
  // reproducible locally) — ensure the earlier ENOENT bug doesn't come
  // back for lib/capture/'s jsdom usage if this line is ever touched again.
  serverExternalPackages: ["jsdom"]
};

export default nextConfig;
