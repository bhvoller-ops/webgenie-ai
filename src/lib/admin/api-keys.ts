import { createHash, randomBytes } from "node:crypto";
export function generateApiKey() { const secret = randomBytes(32).toString("base64url"); const token = `wg_live_${secret}`; return { token, prefix: token.slice(0, 15), hash: hashApiKey(token) }; }
export function hashApiKey(token: string) { return createHash("sha256").update(token).digest("hex"); }
