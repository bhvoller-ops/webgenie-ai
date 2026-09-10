"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, MonitorPlay, Rocket } from "lucide-react";

interface DemoRoomState {
  publicToken: string;
  status: string;
}

/**
 * "Create Demo Room" / share controls (master prompt sections 27-36).
 * Requires prospect.demoUrl to already exist — this never generates a
 * demo itself, it only presents one that Build New Site Demo / Create
 * Redesign Demo already built, matching "reuse existing demo/sitegen
 * architecture, do not duplicate generated site content — link to it."
 */
export function DemoRoomPanel({ prospectId, hasDemoUrl }: { prospectId: string; hasDemoUrl: boolean }) {
  const [room, setRoom] = useState<DemoRoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/demo-room`);
      const json = await res.json();
      setRoom(json.demoRoom ? { publicToken: json.demoRoom.public_token, status: json.demoRoom.status } : null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [prospectId]);

  async function create() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`/api/prospects/${prospectId}/demo-room`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't create the Demo Room.");
      setRoom({ publicToken: json.demoRoom.public_token, status: json.demoRoom.status });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create the Demo Room.");
    } finally {
      setCreating(false);
    }
  }

  const publicUrl = room ? `https://app.vibelabsagency.com/demo/${room.publicToken}` : null;

  async function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(async () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      await fetch(`/api/prospects/${prospectId}/demo-room`, { method: "PATCH" }).catch(() => {});
    });
  }

  if (loading) {
    return (
      <div className="card p-5">
        <Loader2 className="h-4 w-4 animate-spin text-faint" aria-hidden />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="eyebrow mb-3 flex items-center justify-between">
        Demo Room
        <MonitorPlay className="h-4 w-4 text-iris-soft" aria-hidden />
      </div>
      {!hasDemoUrl ? (
        <p className="text-[12.5px] leading-relaxed text-faint">Build a demo first — the Demo Room presents it professionally to the client.</p>
      ) : !room ? (
        <button
          onClick={create}
          disabled={creating}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
          Create Demo Room
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-muted hover:text-ink"
            >
              {copied ? <Check className="h-3 w-3 text-signal-good" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              Copy Demo Link
            </button>
            <a
              href={publicUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 py-1.5 text-[12px] text-muted hover:text-ink"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Preview as Prospect
            </a>
          </div>
          <p className="text-[11px] text-faint">
            {room.status === "shared" ? "Shared with the client." : "Ready — not yet shared."}
          </p>
        </div>
      )}
      {error ? <p className="mt-2 text-[12px] text-signal-bad">{error}</p> : null}
    </div>
  );
}
