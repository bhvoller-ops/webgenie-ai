import { PageShell } from "@/components/shell";
import { ApiKeyCreator } from "@/components/admin/api-key-creator";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/auth/access";
import { defaultPlans, type PlanKey } from "@/lib/admin/plans";
import { revokeApiKeyAction, updateMemberRoleAction, removeMemberAction, revokeInvitationAction, deleteMyAccountAction, manageBillingAction } from "@/app/actions";
import { InviteTeamMemberForm } from "@/components/invite-team-member-form";
import { ConfirmForm } from "@/components/confirm-form";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";

export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const { user, organizationId: orgId, membershipRole } = await requireAdminPage();
  const supabase = await createClient();
  const membership = { organization_id: orgId, role: membershipRole ?? "admin" };
  const [{data:organization},{data:members},{data:invitations},{data:keys},{data:usage},{data:audit}]=await Promise.all([
    supabase.from("organizations").select("id,name,plan_key,subscription_status,trial_ends_at,billing_email,billing_customer_id").eq("id",orgId).single(),
    supabase.from("organization_members").select("user_id,role,created_at").eq("organization_id",orgId).order("created_at"),
    // Excludes role:"partner" — those invites belong to /partners, not this
    // Team section. They used to leak in here unfiltered (found 30 Aug).
    supabase.from("team_invitations").select("id,email,role,expires_at,accepted_at").eq("organization_id",orgId).neq("role","partner").order("created_at",{ascending:false}),
    supabase.from("api_keys").select("id,name,key_prefix,status,scopes,last_used_at,created_at").eq("organization_id",orgId).order("created_at",{ascending:false}),
    supabase.from("usage_events").select("metric,quantity,occurred_at").eq("organization_id",orgId).gte("occurred_at",new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString()),
    supabase.from("audit_logs").select("id,action,target_type,target_id,created_at,metadata").eq("organization_id",orgId).order("created_at",{ascending:false}).limit(20)
  ]);
  const plan=defaultPlans[((organization?.plan_key ?? "starter") in defaultPlans ? organization?.plan_key : "starter") as PlanKey];
  const totals=new Map<string,number>(); for(const event of usage??[]) totals.set(event.metric,(totals.get(event.metric)??0)+event.quantity);
  const canAdmin=["owner","admin"].includes(membership.role);

  // organization_members has no email column (it's an auth.users FK) — the
  // member list used to show a raw user_id instead of a name anyone could
  // recognize. Resolved server-side via the admin client (never sent to the
  // browser) rather than exposing an auth.users join through the anon client.
  const admin = createAdminClient();
  const memberEmails = new Map<string, string>();
  if (members?.length) {
    await Promise.all(members.map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      if (data.user?.email) memberEmails.set(m.user_id, data.user.email);
    }));
  }

  return <PageShell role="admin"><div className="space-y-8"><section><p className="text-sm uppercase tracking-[0.2em] text-slate-400">Administration</p><h1 className="mt-2 text-4xl font-semibold">Workspace settings</h1><p className="mt-3 text-slate-400">Manage access, usage, API credentials, billing state, and operational history.</p><a href="/settings/branding" className="mt-3 inline-block text-sm text-indigo-400 underline decoration-dotted underline-offset-4">Branding — what your own clients see &rarr;</a></section>
  <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Current plan</p><p className="mt-2 text-2xl font-semibold">{plan.name}</p><p className="mt-1 text-sm text-slate-500">${(plan.monthlyCents/100).toFixed(0)}/month</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Subscription</p><p className="mt-2 text-2xl font-semibold capitalize">{organization?.subscription_status?.replace("_"," ")}</p>{organization?.billing_customer_id?<form action={manageBillingAction} className="mt-3"><button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-indigo-500">Manage billing</button></form>:<p className="mt-1 text-sm text-slate-500">Provider connection required for live checkout.</p>}</div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">Your role</p><p className="mt-2 text-2xl font-semibold capitalize">{membership.role}</p><p className="mt-1 text-sm text-slate-500">Workspace: {organization?.name}</p></div></section>
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Monthly usage</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(plan.limits).map(([metric,limit])=>{const used=totals.get(metric)??0; const pct=Math.min(100,Math.round(used/limit*100));return <div key={metric} className="rounded-xl border border-slate-800 p-4"><div className="flex justify-between text-sm"><span className="capitalize">{metric.replaceAll("_"," ")}</span><span>{used}/{limit}</span></div><div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-indigo-400" style={{width:`${pct}%`}}/></div></div>})}</div></section>
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Team</h2>{canAdmin?<InviteTeamMemberForm/>:null}<div className="mt-6 space-y-3">{members?.map((member)=><div key={member.user_id} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"><div><p className="font-medium">{member.user_id===user.id?"You":memberEmails.get(member.user_id)??member.user_id}</p><p className="text-xs text-slate-500">Joined {new Date(member.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-2">{membership.role==="owner"&&member.role!=="owner"?<form action={updateMemberRoleAction} className="flex gap-2"><input type="hidden" name="memberUserId" value={member.user_id}/><select name="role" defaultValue={member.role} className="rounded-lg px-2 py-1 text-sm text-slate-950"><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button className="rounded-lg border border-slate-700 px-3 py-1 text-sm">Save</button></form>:<span className="capitalize text-sm text-slate-400">{member.role}</span>}{membership.role==="owner"&&member.role!=="owner"?<ConfirmForm action={removeMemberAction} confirmMessage={`Remove ${memberEmails.get(member.user_id)??"this member"} from the workspace?`}><input type="hidden" name="memberUserId" value={member.user_id}/><button className="rounded-lg border border-rose-800 px-3 py-1 text-sm text-rose-300">Remove</button></ConfirmForm>:null}</div></div>)}{invitations?.filter(i=>!i.accepted_at).map(inv=><div key={inv.id} className="flex items-center justify-between rounded-xl border border-dashed border-slate-700 px-4 py-3"><div><p>{inv.email}</p><p className="text-xs text-slate-500">Invitation expires {new Date(inv.expires_at).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className="capitalize text-sm text-amber-300">{inv.role} · pending</span>{canAdmin?<form action={revokeInvitationAction}><input type="hidden" name="invitationId" value={inv.id}/><button className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-400 hover:text-rose-300">Revoke</button></form>:null}</div></div>)}</div></section>
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">API keys</h2><p className="mt-2 text-sm text-slate-400">Keys are stored as SHA-256 hashes. The secret is displayed only once.</p>{canAdmin?<div className="mt-5"><ApiKeyCreator/></div>:null}<div className="mt-5 space-y-3">{keys?.map(key=><div key={key.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3"><div><p className="font-medium">{key.name}</p><code className="text-xs text-slate-500">{key.key_prefix}…</code><p className="mt-1 text-xs text-slate-500">Last used: {key.last_used_at?new Date(key.last_used_at).toLocaleString():"Never"}</p></div>{key.status==="active"&&canAdmin?<form action={revokeApiKeyAction}><input type="hidden" name="apiKeyId" value={key.id}/><button className="rounded-lg border border-rose-800 px-3 py-2 text-sm text-rose-300">Revoke</button></form>:<span className="capitalize text-sm text-slate-500">{key.status}</span>}</div>)}</div></section>
  {canAdmin?<section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Audit log</h2><div className="mt-5 space-y-2">{audit?.map(entry=><div key={entry.id} className="grid gap-1 rounded-lg border border-slate-800 px-4 py-3 text-sm md:grid-cols-[220px_1fr_auto]"><span className="font-medium">{entry.action}</span><span className="text-slate-400">{entry.target_type??"workspace"} {entry.target_id??""}</span><time className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</time></div>)}</div></section>:null}
  <section className="rounded-2xl border border-rose-900/60 bg-slate-900 p-6"><h2 className="text-xl font-semibold text-rose-300">Danger zone</h2><p className="mt-2 text-sm text-slate-400">Permanently deletes your login. Workspace data is not exported first — do that beforehand if you need it.</p><div className="mt-5"><DeleteAccountForm action={deleteMyAccountAction}/></div></section>
  </div></PageShell>;
}
