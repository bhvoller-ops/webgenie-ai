import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { Panel, SectionHeading } from "@/components/ui";
import Link from "next/link";
import { PLAYBOOKS, PLAYBOOK_GROUPS, type PlaybookGroup } from "@/lib/playbooks/content";

export default async function PlaybooksPage() {
  const { role } = await requireAdminPage();

  const groups = Object.keys(PLAYBOOK_GROUPS) as PlaybookGroup[];

  return (
    <PageShell role={role}>
      <SectionHeading
        eyebrow="Playbooks"
        title="How to actually run this"
        description="The same plan and scripts Cassey wrote this program from — grouped by motion, not just dropped in a folder."
      />

      <div className="mt-8 space-y-10">
        {groups.map((group) => {
          const entries = PLAYBOOKS.filter((p) => p.group === group);
          if (entries.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {PLAYBOOK_GROUPS[group]}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {entries.map((entry) => (
                  <Link key={entry.slug} href={`/playbooks/${entry.slug}`}>
                    <Panel className="h-full transition-colors hover:border-iris/50">
                      <h3 className="text-base font-semibold text-ink">{entry.title}</h3>
                      <p className="mt-1.5 text-[13px] text-muted">{entry.useFor}</p>
                    </Panel>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
