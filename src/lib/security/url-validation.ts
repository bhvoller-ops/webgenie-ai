import dns from "node:dns/promises";
import net from "node:net";
import { z } from "zod";

const urlSchema = z.string().url();

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain"
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 0 ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized === "::"
  );
}

function isPrivateIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

export interface ValidatedUrl {
  normalizedUrl: string;
  hostname: string;
  resolvedAddresses: string[];
}

export async function validatePublicUrl(input: string): Promise<ValidatedUrl> {
  const parsed = urlSchema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_URL");

  const url = new URL(parsed.data);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("UNSUPPORTED_PROTOCOL");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    blockedHostnames.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("BLOCKED_HOST");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("BLOCKED_IP");
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) throw new Error("DNS_NOT_FOUND");

  const addresses = records.map((record) => record.address);
  if (addresses.some(isPrivateIp)) throw new Error("BLOCKED_IP");

  url.hash = "";
  if (url.pathname === "") url.pathname = "/";

  return {
    normalizedUrl: url.toString(),
    hostname,
    resolvedAddresses: addresses
  };
}
