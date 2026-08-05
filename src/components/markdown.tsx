import type { ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyBase}-c${i++}`}
          className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.85em] text-neon-soft"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(
        <strong key={`${keyBase}-b${i++}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-xl border border-hairline bg-void p-4 font-mono text-[12px] leading-relaxed text-neon-soft"
        >
          {lang ? <div className="mb-2 text-[10px] uppercase tracking-widest text-faint">{lang}</div> : null}
          <code>{body.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Table
    if (line.startsWith("|") && lines[i + 1]?.includes("---")) {
      const header = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-raised">
              <tr>
                {header.map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium text-ink">
                    {inline(h, `th-${h}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-t border-hairline">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-muted">
                      {inline(cell, `td-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const sizes = [
        "text-2xl font-semibold tracking-tight text-ink",
        "text-lg font-semibold tracking-tight text-ink",
        "text-sm font-semibold uppercase tracking-widest text-faint",
        "text-sm font-semibold text-ink",
      ];
      blocks.push(
        <div key={key++} className={`${sizes[level - 1]} ${level <= 2 ? "mt-8 first:mt-0" : "mt-6"}`}>
          {inline(text, `h-${key}`)}
        </div>
      );
      i++;
      continue;
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="space-y-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-iris" aria-hidden />
              <span>{inline(item, `li-${key}-${ii}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="space-y-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
              <span className="font-mono text-[11px] tabular-nums text-iris">{ii + 1}.</span>
              <span>{inline(item, `ol-${key}-${ii}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("|") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="text-[13px] leading-relaxed text-muted">
        {inline(para.join(" "), `p-${key}`)}
      </p>
    );
  }

  return <div className="space-y-3.5">{blocks}</div>;
}
