import Link from "next/link";
import { PageShell } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, industry, primary_goal, primary_cta, status")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <PageShell>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold">Website intelligence projects</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Analyze references, generate original website blueprints, and export build-ready prompts.
        </p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize">
                  {project.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{project.industry}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Primary goal</p>
                  <p className="mt-1">{project.primary_goal}</p>
                </div>
                <div>
                  <p className="text-slate-500">Primary CTA</p>
                  <p className="mt-1">{project.primary_cta}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
          <h2 className="text-xl font-semibold">Create your first project</h2>
          <p className="mt-2 text-slate-400">
            Start with a current website, competitor, benchmark, or inspiration URL.
          </p>
        </div>
      )}
    </PageShell>
  );
}
