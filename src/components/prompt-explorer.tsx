"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Info } from "lucide-react";
import type { PromptPackage, PromptPlatform, ValidationIssue } from "@/lib/prompts/types";
import { DOCUMENT_KIND_LABELS, PLATFORM_LABELS, promptPlatforms } from "@/lib/prompts/types";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import { Pill } from "@/components/ui";
import { cn, formatTokens } from "@/lib/format";

export function PromptExplorer({ pkg }: { pkg: PromptPackage }) {
  const [platform, setPlatform] = useState<PromptPlatform>(pkg.manifest.platform);
  const [activeKind, setActiveKind] = useState(pkg.documents[0]?.kind);

  const active = pkg.documents.find((d) => d.kind === activeKind) ?? pkg.documents[0];
  const bundle = pkg.documents.map((d) => `<!-- ${d.filename} -->\n\n${d.markdown}`).join("\n\n---\n\n");

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-3">Target platform</div>
        <div className="flex flex-wrap gap-2">
          {promptPlatforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                "focus-ring rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                p === platform
                  ? "border-iris bg-iris/15 text-iris-soft shadow-glow"
                  : "border-hairline bg-raised text-muted hover:border-iris/40 hover:text-ink"
              )}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-faint">
          Platform adapters reshape the same canonical blueprint — framework conventions, file
          layout, and instruction style change; the requirements do not.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="card overflow-hidden p-0">
            <div className="border-b border-hairline px-4 py-3">
              <div className="eyebrow">Documents · {pkg.documents.length}</div>
            </div>
            <ul>
              {pkg.documents.map((doc) => {
                const isActive = doc.kind === active?.kind;
                return (
                  <li key={doc.kind}>
                    <button
                      onClick={() => setActiveKind(doc.kind)}
                      className={cn(
                        "focus-ring flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-l-iris bg-iris/[0.08]"
                          : "border-l-transparent hover:bg-raised"
                      )}
                    >
                      <FileText
                        className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-iris-soft" : "text-faint")}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[13px]", isActive ? "text-ink" : "text-muted")}>
                          {DOCUMENT_KIND_LABELS[doc.kind]}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-faint">
                          {doc.filename}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-faint">
                        {formatTokens(doc.estimatedTokens)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-hairline p-3">
              <CopyButton text={bundle} label="Copy full package" className="w-full justify-center" />
            </div>
          </div>

          <ValidationPanel issues={pkg.validationIssues} valid={pkg.manifest.validation.valid} />
        </aside>

        <div className="card overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-5 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">{active?.title}</h3>
              <p className="truncate font-mono text-[11px] text-faint">
                {PLATFORM_LABELS[platform]} · {active?.filename} ·{" "}
                {formatTokens(active?.estimatedTokens ?? 0)} tokens
              </p>
            </div>
            <div className="ml-auto">
              <CopyButton text={active?.markdown ?? ""} label="Copy document" />
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {active ? <Markdown source={active.markdown} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationPanel({ issues, valid }: { issues: ValidationIssue[]; valid: boolean }) {
  const icons = {
    error: <AlertCircle className="h-3.5 w-3.5 shrink-0 text-signal-bad" aria-hidden />,
    warning: <AlertCircle className="h-3.5 w-3.5 shrink-0 text-signal-warn" aria-hidden />,
    info: <Info className="h-3.5 w-3.5 shrink-0 text-signal-info" aria-hidden />,
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="eyebrow">Validation</div>
        <Pill tone={valid ? "good" : "bad"}>
          {valid ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : null}
          {valid ? "Passed" : "Failed"}
        </Pill>
      </div>
      <ul className="space-y-3">
        {issues.map((issue) => (
          <li key={issue.code} className="flex gap-2.5">
            {icons[issue.severity]}
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide text-faint">{issue.code}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{issue.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
