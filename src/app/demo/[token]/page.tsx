import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIntroLine } from "@/lib/prospect/demo-room-content";

export const dynamic = "force-dynamic";

/**
 * The client-facing Demo Room (master prompt sections 27-36). Public,
 * unauthenticated — same trust model as /pay/[callLogId]: a real,
 * random, non-sequential token is the only "auth" (never the prospect's
 * own id, unlike /pay's use of call_log.id directly, to avoid any
 * internal-id leakage a client-facing link shouldn't carry). Reads
 * through the admin client, scoped by an explicit .eq("public_token",
 * ...) filter — never through demo_rooms' own RLS policy, which
 * requires a real org membership a prospect visitor will never have.
 *
 * Deliberately excludes everything section 31 lists: no raw audit JSON,
 * no internal opportunity score/confidence, no sales angle, no
 * suggested opener, no priority, no NBA reasoning, no user notes, no
 * crawl/debug logs, no provider details, no prompts, no cost data.
 * Only demo_rooms.client_safe_findings (curated at creation time) and
 * the business's own public-facing name/location ever render here.
 */
export default async function DemoRoomPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: room } = await admin.from("demo_rooms").select("*").eq("public_token", token).maybeSingle();
  if (!room) notFound();

  const { data: org } = await admin.from("organizations").select("name").eq("id", room.organization_id).maybeSingle();
  const { data: branding } = await admin
    .from("org_branding")
    .select("brand_name, logo_url, primary_color, accent_color, support_email, support_phone")
    .eq("organization_id", room.organization_id)
    .maybeSingle();

  const { data: prospect } = await admin.from("prospects").select("demo_url, city, state").eq("id", room.prospect_id).maybeSingle();

  const agencyName = branding?.brand_name || org?.name || "Our team";
  const accent = branding?.primary_color && /^#[0-9a-f]{6}$/i.test(branding.primary_color) ? branding.primary_color : "#7C5CFF";

  const findings = (room.client_safe_findings as { label: string; detail: string }[]).filter((f) => f.label === "What we found");
  const improvements = (room.client_safe_findings as { label: string; detail: string }[]).filter((f) => f.label === "What we'd improve");
  const demoUrl = prospect?.demo_url ? new URL(prospect.demo_url, "https://app.vibelabsagency.com").toString() : null;

  return (
    <div style={{ background: "#F7F7FA", minHeight: "100vh", color: "#1A1A2E", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          {branding?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logo_url} alt="" style={{ height: 32, width: "auto" }} />
          ) : null}
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6B80" }}>{agencyName}</span>
        </header>

        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{room.title}</h1>
        {prospect?.city ? (
          <p style={{ marginTop: 6, fontSize: 14, color: "#6B6B80" }}>
            {prospect.city}
            {prospect.state ? `, ${prospect.state}` : ""}
          </p>
        ) : null}

        <p style={{ marginTop: 20, fontSize: 16, lineHeight: 1.6 }}>{buildIntroLine(room.title)}</p>

        {findings.length > 0 ? (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B80" }}>Digital Opportunity Review</h2>
            <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 1.7 }}>
              {findings.map((f, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 15 }}>
                  {f.detail}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {improvements.length > 0 ? (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B80" }}>What We&rsquo;d Improve</h2>
            <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 1.7 }}>
              {improvements.map((f, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 15 }}>
                  {f.detail}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {demoUrl ? (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B6B80" }}>The Demo</h2>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "10px 18px",
                borderRadius: 10,
                background: "#fff",
                border: "1px solid #E2E2EA",
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1A2E",
                textDecoration: "none"
              }}
            >
              View the demo site ↗
            </a>
          </section>
        ) : null}

        <div style={{ marginTop: 40 }}>
          <a
            href={room.cta_url || (branding?.support_email ? `mailto:${branding.support_email}` : branding?.support_phone ? `tel:${branding.support_phone}` : "#")}
            style={{
              display: "inline-block",
              padding: "14px 28px",
              borderRadius: 12,
              background: accent,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            {room.cta_label}
          </a>
        </div>

        <footer style={{ marginTop: 56, fontSize: 12, color: "#9B9BAE" }}>
          Prepared by {agencyName}
          {branding?.support_email ? ` · ${branding.support_email}` : ""}
          {branding?.support_phone ? ` · ${branding.support_phone}` : ""}
        </footer>
      </div>
    </div>
  );
}
