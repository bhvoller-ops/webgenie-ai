import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { deliveryTargetProfiles } from "@/lib/delivery/adapters";
import type { DeliveryTarget } from "@/lib/delivery/types";

export const dynamic = "force-dynamic";

export default async function DeliveryPage({ params }: { params: Promise<{ id: string; deliveryId: string }> }) {
  const { id, deliveryId } = await params;
  const supabase = await createClient();
  const [{ data: run }, { data: files }, { data: events }] = await Promise.all([
    supabase.from("delivery_runs").select("id,target,status,manifest,file_count,total_bytes,external_url,error_message,created_at,ready_at").eq("id", deliveryId).eq("project_id", id).maybeSingle(),
    supabase.from("delivery_files").select("id,path,purpose,byte_size").eq("delivery_run_id", deliveryId).order("path"),
    supabase.from("implementation_events").select("id,event_type,title,detail,external_url,created_at").eq("delivery_run_id", deliveryId).order("created_at", { ascending: false })
  ]);
  if (!run) notFound();
  const profile = deliveryTargetProfiles[run.target as DeliveryTarget];
  const manifest = run.manifest as any;
  return <PageShell><div className="flex flex-col gap-8">
    <section><a href={`/projects/${id}`} className="text-sm text-slate-400">← Back to project</a><p className="mt-6 text-sm uppercase tracking-[0.2em] text-sky-300">Implementation delivery</p><h1 className="mt-2 text-4xl font-semibold">{profile.label}</h1><p className="mt-3 max-w-3xl text-slate-400">{profile.description}</p></section>
    <section className="grid gap-4 md:grid-cols-4">{[["Status",run.status],["Files",run.file_count],["Size",`${Math.ceil(Number(run.total_bytes)/1024)} KB`],["Mode",profile.mode.replace("_"," ")]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 capitalize font-semibold">{value}</p></div>)}</section>
    <section className="rounded-2xl border border-sky-900 bg-sky-950/20 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Delivery package</h2><p className="mt-2 text-sm text-slate-400">Download the complete traceable implementation handoff.</p></div><a href={`/api/delivery-runs/${run.id}/download`} className="rounded-lg bg-sky-300 px-4 py-2 font-medium text-slate-950">Download ZIP</a></div><div className="mt-6 grid gap-3 md:grid-cols-2">{files?.map((file)=><div key={file.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><code className="text-sm text-sky-300">{file.path}</code><p className="mt-2 text-xs text-slate-500">{file.purpose} · {file.byte_size.toLocaleString()} bytes</p></div>)}</div></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Release gates</h2><div className="mt-5 space-y-3">{manifest?.handoffChecklist?.map((item:string,index:number)=><div key={item} className="flex gap-3 rounded-xl border border-slate-800 p-4"><span className="text-sky-300">{index+1}</span><p>{item}</p></div>)}</div></section>
    {events?.length ? <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Implementation activity</h2><div className="mt-5 space-y-3">{events.map((event)=><div key={event.id} className="rounded-xl border border-slate-800 p-4"><div className="flex justify-between gap-4"><p className="font-medium">{event.title}</p><time className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</time></div>{event.detail?<p className="mt-2 text-sm text-slate-400">{event.detail}</p>:null}</div>)}</div></section>:null}
  </div></PageShell>;
}
