import { AppShell } from "@/components/app-shell";
import { createProject } from "@/app/actions";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Create project</h1>
        <form action={createProject} className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <label className="block">
            <span className="text-sm text-slate-300">Project name</span>
            <input name="name" required className="mt-2 w-full rounded-lg px-3 py-2" placeholder="Atlas Roofing redesign" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Industry</span>
            <input name="industry" required className="mt-2 w-full rounded-lg px-3 py-2" placeholder="Roofing contractor" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Primary goal</span>
            <select name="primaryGoal" className="mt-2 w-full rounded-lg px-3 py-2">
              <option>Lead generation</option>
              <option>Appointment booking</option>
              <option>Online sale</option>
              <option>Authority building</option>
              <option>Information</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Primary CTA</span>
            <input name="primaryCta" required className="mt-2 w-full rounded-lg px-3 py-2" placeholder="Request a free inspection" />
          </label>
          <button className="rounded-lg bg-white px-4 py-2 font-medium text-slate-950">
            Create project
          </button>
        </form>
      </div>
    </AppShell>
  );
}
