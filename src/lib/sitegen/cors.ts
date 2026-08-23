import { NextResponse } from "next/server";

/**
 * Every route a generated site calls back to is cross-origin by design once
 * that site is deployed to a client's own domain instead of previewed from
 * this app — no cookies/credentials involved, so a wide-open origin is the
 * right tradeoff (same threat model as the routes already being public and
 * unauthenticated). Without this, the browser silently drops the response
 * (or blocks the preflight) as soon as a site isn't same-origin — which is
 * every real deployed client site.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export function corsJson(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status, headers: CORS_HEADERS });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
