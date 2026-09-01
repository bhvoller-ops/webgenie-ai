import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { getAccessContext } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

/**
 * Where requireAdminPage() sends an admin whose org is still
 * subscription_status "trialing" past its trial_ends_at — see §2r. Its own
 * guard is deliberately narrower than requireAdminPage(): a trial-expired
 * admin failing that check is exactly who needs to land here, so this page
 * only requires a signed-in admin, not a non-expired one.
 */
export default async function TrialExpiredPage() {
  const { user, role, trialExpired } = await getAccessContext();
  if (!user) redirect("/login");
  if (role !== "admin") redirect("/");
  if (!trialExpired) redirect("/projects/new");

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
        <h1 className="mt-3 text-2xl font-semibold">Your free trial has ended</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Your 7-day trial is over, so your workspace is paused. Reach out and we&apos;ll get you upgraded —
          your projects, audits, and prompt packages are all still here waiting.
        </p>

        <a
          href="mailto:wallang@gmail.com?subject=Upgrading%20my%20WebGenie%20trial"
          className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 font-medium text-slate-950"
        >
          Get in touch
        </a>

        <form action={signOut} className="mt-4">
          <button type="submit" className="text-sm text-slate-500 underline decoration-dotted underline-offset-4 hover:text-slate-300">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
