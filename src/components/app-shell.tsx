import Link from "next/link";
import { BrainCircuit, Plus, Settings } from "lucide-react";
import { signOut } from "@/app/actions";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-5 w-5" />
            WebGenie AI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm"><Settings className="h-4 w-4" />Settings</Link>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
            <form action={signOut}>
              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
