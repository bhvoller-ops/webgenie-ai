import { notFound } from "next/navigation";
import { ArrowRight, FileCode2 } from "lucide-react";
import { Breadcrumbs, PageShell } from "@/components/shell";
import { Button, Card, Eyebrow, MetaRow, Panel, Pill } from "@/components/ui";
import { Tabs } from "@/components/tabs";
import { getBlueprint, getProject } from "@/lib/data/provider";
import { requireAdminPage } from "@/lib/auth/access";
import type { PageBlueprint, WebsiteBlueprint } from "@/lib/blueprint/types";
import { cn, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [project, blueprint] = await Promise.all([getProject(id), getBlueprint(id)]);
  if (!project || !blueprint) notFound();

  return (
    <PageShell role="admin">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/" },
          { label: project.name, href: `/projects/${id}` },
          { label: "Blueprint" },
        ]}
      />

      <Panel className="mt-6" padded={false}>
        <div className="p-6 sm:p-10">
          <Eyebrow className="text-iris-soft">Website Blueprint · schema v{blueprint.schemaVersion}</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display-md font-semibold text-ink">
            {blueprint.websiteStrategy.positioning}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
            {blueprint.websiteStrategy.audience}
          </p>
          <div className="mt-7">
            <Button href={`/projects/${id}/prompts`}>
              <FileCode2 className="h-4 w-4" aria-hidden />
              Open prompt package
            </Button>
          </div>
        </div>
        <div className="border-t border-hairline">
          <MetaRow
            items={[
              { label: "Pages", value: `${blueprint.sitemap.length}` },
              { label: "Components", value: `${blueprint.reusableComponents.length}` },
              { label: "Source job", value: blueprint.sourceAnalysisJobId },
              { label: "Generated", value: formatDateTime(blueprint.generatedAt) },
            ]}
          />
        </div>
      </Panel>

      <div className="mt-14">
        <Tabs
          items={[
            { id: "strategy", label: "Strategy", content: <StrategyTab blueprint={blueprint} /> },
            {
              id: "ia",
              label: "Architecture",
              badge: blueprint.sitemap.length,
              content: <ArchitectureTab blueprint={blueprint} />,
            },
            { id: "tokens", label: "Design tokens", content: <TokensTab blueprint={blueprint} /> },
            {
              id: "components",
              label: "Components",
              badge: blueprint.reusableComponents.length,
              content: <ComponentsTab blueprint={blueprint} />,
            },
            {
              id: "pages",
              label: "Page plans",
              badge: blueprint.pages.length,
              content: <PagesTab pages={blueprint.pages} />,
            },
            {
              id: "requirements",
              label: "Requirements",
              content: <RequirementsTab blueprint={blueprint} />,
            },
          ]}
        />
      </div>
    </PageShell>
  );
}

function StrategyTab({ blueprint }: { blueprint: WebsiteBlueprint }) {
  const s = blueprint.websiteStrategy;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="eyebrow mb-3">Primary goal</div>
        <p className="text-sm text-ink">{s.primaryGoal}</p>
        <div className="eyebrow mb-3 mt-6">Primary call to action</div>
        <Pill tone="iris">{s.primaryCta}</Pill>
      </Card>

      <Card>
        <div className="eyebrow mb-4">Conversion path</div>
        <ol className="space-y-3">
          {s.conversionPath.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-iris/40 bg-iris/10 font-mono text-[10px] text-iris-soft">
                {i + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function ArchitectureTab({ blueprint }: { blueprint: WebsiteBlueprint }) {
  const byId = new Map(blueprint.sitemap.map((p) => [p.pageId, p]));
  const roots = blueprint.sitemap.filter((p) => !p.parentPageId);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <Card>
        <div className="eyebrow mb-4">Sitemap</div>
        <ul className="space-y-1">
          {roots.map((root) => {
            const children = blueprint.sitemap.filter((p) => p.parentPageId === root.pageId);
            return (
              <li key={root.pageId}>
                <SitemapRow slug={root.slug} label={root.label} priority={root.priority} />
                {children.length ? (
                  <ul className="ml-4 mt-1 space-y-1 border-l border-hairline pl-4">
                    {children.map((child) => (
                      <li key={child.pageId}>
                        <SitemapRow slug={child.slug} label={child.label} priority={child.priority} nested />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="space-y-4">
        <Card>
          <div className="eyebrow mb-3">Primary navigation</div>
          <div className="flex flex-wrap gap-2">
            {blueprint.navigation.primary.map((pid) => (
              <Pill key={pid} tone="iris">
                {byId.get(pid)?.label ?? pid}
              </Pill>
            ))}
          </div>
          <div className="eyebrow mb-3 mt-6">Utility</div>
          <div className="flex flex-wrap gap-2">
            {blueprint.navigation.utility.map((pid) => (
              <Pill key={pid} tone="neon">
                {byId.get(pid)?.label ?? pid}
              </Pill>
            ))}
          </div>
        </Card>

        <Card>
          <div className="eyebrow mb-4">Footer groups</div>
          <div className="space-y-4">
            {blueprint.navigation.footerGroups.map((group) => (
              <div key={group.label}>
                <div className="text-[13px] font-medium text-ink">{group.label}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.pageIds.map((pid) => (
                    <span key={pid} className="font-mono text-[11px] text-faint">
                      {byId.get(pid)?.slug ?? pid}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SitemapRow({
  slug,
  label,
  priority,
  nested,
}: {
  slug: string;
  label: string;
  priority: number;
  nested?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-raised",
        nested && "text-[13px]"
      )}
    >
      <span className="font-mono text-[11px] tabular-nums text-faint">
        {String(priority).padStart(2, "0")}
      </span>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <span className="ml-auto font-mono text-[11px] text-neon-soft">{slug}</span>
    </div>
  );
}

function TokensTab({ blueprint }: { blueprint: WebsiteBlueprint }) {
  const t = blueprint.designTokens;
  return (
    <div className="space-y-4">
      <Card>
        <div className="eyebrow mb-4">Colour roles</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(t.colorRoles).map(([role, hex]) => (
            <div key={role} className="rounded-lg border border-hairline bg-canvas p-3">
              <div
                className="h-14 w-full rounded border border-white/10"
                style={{ backgroundColor: hex }}
                aria-hidden
              />
              <div className="mt-2.5 text-[12px] font-medium capitalize text-ink">
                {role.replace(/([A-Z])/g, " $1").toLowerCase()}
              </div>
              <div className="font-mono text-[11px] uppercase text-faint">{hex}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="eyebrow mb-4">Typography</div>
          <div className="space-y-3 text-[13px]">
            <div>
              <div className="text-faint">Headings</div>
              <div className="mt-1 text-ink">{t.typography.headingStyle}</div>
            </div>
            <div>
              <div className="text-faint">Body</div>
              <div className="mt-1 text-ink">{t.typography.bodyStyle}</div>
            </div>
            <div>
              <div className="text-faint">Scale</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {t.typography.scale.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-raised px-2 py-0.5 font-mono text-[11px] text-neon-soft"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="eyebrow mb-4">Spacing</div>
          <dl className="space-y-3 text-[13px]">
            {Object.entries(t.spacing).map(([k, v]) => (
              <div key={k}>
                <dt className="capitalize text-faint">{k}</dt>
                <dd className="mt-0.5 font-mono text-[12px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <div className="eyebrow mb-4">Radius & elevation</div>
          <dl className="space-y-3 text-[13px]">
            {Object.entries(t.radius).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="capitalize text-faint">{k}</dt>
                <dd className="font-mono text-[12px] text-ink">{v}</dd>
              </div>
            ))}
            {Object.entries(t.shadows).map(([k, v]) => (
              <div key={k}>
                <dt className="capitalize text-faint">{k} shadow</dt>
                <dd className="mt-0.5 break-all font-mono text-[11px] text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

function ComponentsTab({ blueprint }: { blueprint: WebsiteBlueprint }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {blueprint.reusableComponents.map((c) => (
        <Card key={c.id}>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="iris">{c.type}</Pill>
            {c.conversionRole ? <Pill tone="neon">{c.conversionRole}</Pill> : null}
            <span className="ml-auto font-mono text-[11px] text-faint">{c.id}</span>
          </div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-ink">{c.purpose}</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <div className="eyebrow mb-2">Content</div>
              <ul className="space-y-1.5">
                {c.contentRequirements.map((r) => (
                  <li key={r} className="text-[12px] leading-relaxed text-muted">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-2">Behaviour</div>
              <ul className="space-y-1.5">
                {c.behavior.map((b) => (
                  <li key={b} className="text-[12px] leading-relaxed text-muted">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {c.evidenceRefs?.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-hairline pt-3">
              <span className="text-[11px] text-faint">Traces to</span>
              {c.evidenceRefs.map((ref) => (
                <span key={ref} className="font-mono text-[11px] text-neon-soft">
                  {ref}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

function PagesTab({ pages }: { pages: PageBlueprint[] }) {
  return (
    <div className="space-y-6">
      {pages.map((page) => (
        <Card key={page.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-neon-soft">{page.slug}</span>
                <Pill>{page.pageType.replace("_", " ")}</Pill>
              </div>
              <h3 className="mt-2 text-base font-semibold text-ink">{page.title}</h3>
              <p className="mt-1.5 text-[13px] text-muted">{page.primaryGoal}</p>
            </div>
            <Pill tone="iris">{page.primaryCta}</Pill>
          </div>

          <div className="mt-5 rounded-lg border border-hairline bg-canvas/60 p-4">
            <div className="eyebrow mb-3">SEO</div>
            <dl className="grid gap-3 text-[12px] sm:grid-cols-2">
              <div>
                <dt className="text-faint">Title template</dt>
                <dd className="mt-0.5 font-mono text-ink">{page.seo.titleTemplate}</dd>
              </div>
              <div>
                <dt className="text-faint">Target intent</dt>
                <dd className="mt-0.5 text-ink">{page.seo.targetIntent}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-faint">Description brief</dt>
                <dd className="mt-0.5 text-muted">{page.seo.metaDescriptionBrief}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-faint">Schema</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {page.seo.schemaTypes.map((s) => (
                    <span key={s} className="rounded bg-raised px-2 py-0.5 font-mono text-[11px] text-neon-soft">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-5">
            <div className="eyebrow mb-3">Sections · {page.sections.length}</div>
            <ol className="space-y-2">
              {page.sections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <li
                    key={section.id}
                    className="flex gap-4 rounded-lg border border-hairline bg-canvas/50 p-4"
                  >
                    <span className="font-mono text-xs tabular-nums text-faint">
                      {String(section.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium text-ink">{section.name}</span>
                        <Pill>{section.component.type}</Pill>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{section.objective}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {section.component.contentRequirements.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="rounded border border-hairline px-2 py-0.5 text-[11px] text-faint"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
                  </li>
                ))}
            </ol>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RequirementsTab({ blueprint }: { blueprint: WebsiteBlueprint }) {
  const groups: Array<[string, string[]]> = [
    ["Accessibility", blueprint.globalRequirements.accessibility],
    ["Performance", blueprint.globalRequirements.performance],
    ["SEO", blueprint.globalRequirements.seo],
    ["AI search", blueprint.globalRequirements.aiSearch],
    ["Analytics", blueprint.globalRequirements.analytics],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map(([label, items]) => (
        <Card key={label}>
          <SectionHeadingSmall label={label} count={items.length} />
          <ul className="mt-4 space-y-2.5">
            {items.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-iris" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function SectionHeadingSmall({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-ink">{label}</h3>
      <span className="font-mono text-[11px] text-faint">{count}</span>
    </div>
  );
}
