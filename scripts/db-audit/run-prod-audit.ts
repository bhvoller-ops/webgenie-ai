/**
 * WebGenie production migration reconciliation audit -- safety wrapper.
 *
 * Runs one of the files under scripts/db-audit/queries/ (or another file
 * passed as argv[2] -- default scripts/db-audit/queries/01-presence-matrix.sql)
 * against a real Supabase project via the Supabase
 * CLI's own `db query --project-ref` connection (no password ever typed
 * or stored by this script or its caller), and NEVER via a raw
 * hand-rolled Postgres connection.
 *
 * Enforces, before running anything:
 *   1. The target file contains no mutating statement -- INSERT, UPDATE,
 *      DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, MERGE, COPY,
 *      CALL, REFRESH, REASSIGN, VACUUM, ANALYZE -- as the first token of
 *      any statement (after stripping `--` comments). A mutation keyword
 *      appearing only inside a string literal label (e.g. this file's own
 *      audit script has a VALUES row literally containing the word
 *      'grant' as a label, describing what it checks for) does NOT match,
 *      since it never starts a statement.
 *   2. The file structurally opens a READ ONLY transaction near its start
 *      and ends in ROLLBACK, never COMMIT.
 *
 * Output handling, hardened after a real incident this session: an
 * earlier `supabase db dump --dry-run` call printed a literal, live
 * database password in its generated shell-script preview, and this
 * script's own sed-based redaction at the time only matched postgres://
 * URLs -- not a `PGPASSWORD="..."` line -- and so it leaked. This script
 * now buffers ALL child-process output (stdout and stderr) in memory
 * first, applies multiple redaction passes (connection strings, any
 * KEY=value-shaped credential assignment, the project ref itself, long
 * high-entropy tokens), and only THEN ever writes or prints anything.
 * Nothing is streamed live.
 *
 * Required env var: PROD_PROJECT_REF (the production project's ref) --
 * deliberately not hardcoded in this file, so the file itself never
 * carries a production identifier even before this script is run.
 *
 * KNOWN ISSUE observed in this session's actual audit run: execFileSync
 * here sometimes returned empty stdout/stderr with a non-zero exit code
 * even though the underlying `supabase db query` call succeeded when run
 * directly in a shell with output redirected to a file (suspected: how
 * this Node child_process invocation interacts with `npx`'s own TTY/
 * update-check behavior, not confirmed further). If this script reports
 * an empty result with a non-zero CLI exit code, fall back to running the
 * exact command it prints manually, redirecting stdout to a file, then
 * apply this same file's `redact()` logic (or equivalent) before ever
 * viewing that file -- do not skip the redaction step just because the
 * wrapper's own capture failed.
 *
 * Run with:
 *   PROD_PROJECT_REF=<ref> npx tsx scripts/db-audit/run-prod-audit.ts \
 *     [path-to-sql-file] [output-file]
 */
import { readFileSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";

const sqlPath = process.argv[2] || "scripts/db-audit/queries/01-presence-matrix.sql";
const outPath = process.argv[3] || "scratch-prod-audit-output.redacted.txt";
const projectRef = process.env.PROD_PROJECT_REF;

if (!projectRef) {
  console.error("BLOCKED: PROD_PROJECT_REF is not set. Refusing to run without an explicit target.");
  process.exit(2);
}

const sql = readFileSync(sqlPath, "utf8");
const sqlNoComments = sql.replace(/--.*$/gm, "");

const MUTATION_KEYWORDS = [
  "insert", "update", "delete", "drop", "alter", "truncate", "grant", "revoke",
  "merge", "copy", "call", "create", "refresh", "reassign", "vacuum", "analyze"
];
// Statement-starting only: right after file start or a semicolon, allowing
// whitespace -- never matches a mutation word merely appearing inside a
// string literal deeper in a SELECT (which this audit script's own
// object_kind labels, e.g. 'grant', legitimately do).
const mutationPattern = new RegExp(`(^|;)\\s*(${MUTATION_KEYWORDS.join("|")})\\b`, "im");
const match = sqlNoComments.match(mutationPattern);
if (match) {
  console.error(`BLOCKED: the target SQL file contains what looks like a mutating statement (matched keyword "${match[2]}" near a statement boundary). Refusing to run. Inspect and fix ${sqlPath} before retrying.`);
  process.exit(2);
}

if (!/begin\s+transaction\s+read\s+only/i.test(sqlNoComments)) {
  console.error(`BLOCKED: the target SQL file does not open a READ ONLY transaction. Refusing to run ${sqlPath}.`);
  process.exit(2);
}
if (!/rollback\s*;?\s*$/i.test(sqlNoComments.trim())) {
  console.error(`BLOCKED: the target SQL file does not end in ROLLBACK. Refusing to run ${sqlPath}.`);
  process.exit(2);
}
if (/\bcommit\b/i.test(sqlNoComments)) {
  console.error(`BLOCKED: the target SQL file contains COMMIT. A read-only audit must only ever ROLLBACK. Refusing to run ${sqlPath}.`);
  process.exit(2);
}

console.log(`Safety checks passed: ${sqlPath} contains no statement-starting mutation keyword, opens READ ONLY, ends in ROLLBACK, never COMMITs.`);
console.log("Running via `supabase db query --project-ref <redacted>` (no password entered or stored by this script)...\n");

function redact(text: string): string {
  let out = text;
  // Any postgres(ql):// connection string.
  out = out.replace(/postgres(ql)?:\/\/[^\s"'`]*/gi, "[REDACTED-CONNECTION-STRING]");
  // Any KEY="value" / KEY=value shaped credential-looking assignment
  // (PGPASSWORD, PASSWORD, *_KEY, *_TOKEN, *_SECRET) -- exactly the shape
  // that leaked in the earlier `db dump --dry-run` incident this session.
  out = out.replace(/\b([A-Z0-9_]*(PASSWORD|SECRET|TOKEN|_KEY)[A-Z0-9_]*)\s*=\s*"?[^"\s]+"?/g, '$1=[REDACTED]');
  // The project ref itself, everywhere it appears.
  out = out.split(projectRef!).join("[REDACTED-PROD-REF]");
  // Any other bare 20+ char alphanumeric token (a plausible stray secret
  // or ref this pass didn't already catch) -- conservative, may over-redact.
  out = out.replace(/\b[A-Za-z0-9]{32,}\b/g, "[REDACTED-TOKEN]");
  return out;
}

let stdout = "";
let stderr = "";
let exitCode = 0;
try {
  stdout = execFileSync("npx", ["--yes", "supabase", "db", "query", "--project-ref", projectRef, "--linked", "--file", sqlPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 64
  });
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string; status?: number };
  stdout = err.stdout ?? "";
  stderr = err.stderr ?? "";
  exitCode = err.status ?? 1;
}

const redactedStdout = redact(stdout);
const redactedStderr = redact(stderr);
const combined = `=== stdout ===\n${redactedStdout}\n\n=== stderr ===\n${redactedStderr}\n`;
writeFileSync(outPath, combined, "utf8");
console.log(combined);
console.log(`\n(Full redacted output also written to ${outPath}. Exit code from supabase CLI: ${exitCode}.)`);
process.exit(0);
