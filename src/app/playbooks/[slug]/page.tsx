import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel } from "@/components/ui";
import { getPlaybook, readPlaybookMarkdownHtml, PLAYBOOK_GROUPS } from "@/lib/playbooks/content";

export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { role } = await requireAdminPage();
  const { slug } = await params;
  const entry = getPlaybook(slug);
  if (!entry) notFound();

  return (
    <PageShell role={role}>
      <Eyebrow>{PLAYBOOK_GROUPS[entry.group]}</Eyebrow>
      <h1 className="mt-2 text-display-md font-semibold text-ink">{entry.title}</h1>
      <p className="mt-2 text-sm text-muted">{entry.useFor}</p>

      <div className="mt-8">
        {entry.kind === "html" ? (
          <Panel padded={false} className="overflow-hidden">
            {/* Standalone document, not a fragment — sandboxed iframe, not
                inline injection, matching how the rest of this app treats
                foreign/complete HTML documents. */}
            <iframe
              src={`/api/playbooks/raw/${entry.slug}`}
              title={entry.title}
              sandbox="allow-same-origin"
              className="h-[80vh] w-full border-0"
            />
          </Panel>
        ) : (
          <Panel>
            <PlaybookMarkdown entry={entry} />
          </Panel>
        )}
      </div>
    </PageShell>
  );
}

async function PlaybookMarkdown({ entry }: { entry: NonNullable<ReturnType<typeof getPlaybook>> }) {
  const html = await readPlaybookMarkdownHtml(entry);
  // Sanitized server-side via sanitize-html in readPlaybookMarkdownHtml.
  return <div className="prose-playbook" dangerouslySetInnerHTML={{ __html: html }} />;
}
