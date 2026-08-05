import { notFound } from "next/navigation";
import { Breadcrumbs, PageShell } from "@/components/shell";
import { Eyebrow, MetaRow, Panel } from "@/components/ui";
import { PromptExplorer } from "@/components/prompt-explorer";
import { getProject, getPromptPackage } from "@/lib/data/provider";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PromptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, pkg] = await Promise.all([getProject(id), getPromptPackage(id)]);
  if (!project || !pkg) notFound();

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/" },
          { label: project.name, href: `/projects/${id}` },
          { label: "Prompt package" },
        ]}
      />

      <Panel className="mt-6" padded={false}>
        <div className="p-6 sm:p-10">
          <Eyebrow className="text-iris-soft">
            Prompt Package · schema v{pkg.manifest.schemaVersion}
          </Eyebrow>
          <h1 className="mt-4 max-w-2xl text-display-md font-semibold text-ink">
            A build-ready package, adapted per platform
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Every document below derives from the same canonical blueprint. Validation runs against
            the blueprint, not the prose, so an adapter change can never silently drop a requirement.
          </p>
        </div>
        <div className="border-t border-hairline">
          <MetaRow
            items={[
              { label: "Package", value: pkg.manifest.packageId },
              { label: "Framework", value: pkg.manifest.framework },
              {
                label: "Total tokens",
                value: pkg.manifest.totalEstimatedTokens.toLocaleString(),
              },
              { label: "Generated", value: formatDateTime(pkg.manifest.generatedAt) },
            ]}
          />
        </div>
      </Panel>

      <div className="mt-12">
        <PromptExplorer pkg={pkg} />
      </div>
    </PageShell>
  );
}
