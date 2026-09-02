"use client";

import { useRef, useState } from "react";
import { Panel, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { updateOrgBrandingAction } from "@/app/actions";

interface Branding {
  brand_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  support_email: string | null;
  support_phone: string | null;
  primary_niche: string | null;
}

const fieldClasses =
  "focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2 text-sm text-ink placeholder:text-faint";
const labelClasses = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

/**
 * Logo/favicon upload goes straight from the browser to the org-branding
 * storage bucket (public, RLS-scoped to this org's own "<organizationId>/"
 * prefix — see migration 029) using the user's own session, not through a
 * server route — no reason to proxy file bytes through Next.js when the
 * bucket's own RLS already does the access check. Only the resulting
 * public URL travels to updateOrgBrandingAction.
 */
export function BrandingForm({
  organizationId,
  initial,
}: {
  organizationId: string;
  initial: Branding | null;
}) {
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(initial?.favicon_url ?? "");
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  async function uploadAsset(file: File, kind: "logo" | "favicon") {
    setUploading(kind);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      // Path always includes a timestamp, so it's always new — upsert isn't
      // needed (and the org-branding bucket's insert policy alone doesn't
      // cover it: upsert makes the client check for an existing object
      // first, which needs a SELECT policy this bucket doesn't have —
      // confirmed live, upsert:true made even a legitimate first-time
      // upload fail with an RLS violation).
      const path = `${organizationId}/${kind}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("org-branding").upload(path, file, {
        cacheControl: "3600",
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("org-branding").getPublicUrl(path);
      if (kind === "logo") setLogoUrl(data.publicUrl);
      else setFaviconUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to upload ${kind}.`);
    } finally {
      setUploading(null);
    }
  }

  return (
    <Panel className="mt-6 max-w-2xl">
      <form
        action={async (formData) => {
          setError("");
          try {
            await updateOrgBrandingAction(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save branding.");
          }
        }}
        className="space-y-5"
      >
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <input type="hidden" name="faviconUrl" value={faviconUrl} />

        <div>
          <label className={labelClasses} htmlFor="brandName">
            Brand name
          </label>
          <input
            id="brandName"
            name="brandName"
            defaultValue={initial?.brand_name ?? ""}
            placeholder="Your agency's name"
            className={fieldClasses}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={labelClasses}>Logo</span>
            {logoUrl && <img src={logoUrl} alt="Logo preview" className="mb-2 h-12 w-auto rounded border border-hairline bg-white p-1" />}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="text-xs text-muted"
              onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], "logo")}
            />
            {uploading === "logo" && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          </div>
          <div>
            <span className={labelClasses}>Favicon</span>
            {faviconUrl && <img src={faviconUrl} alt="Favicon preview" className="mb-2 h-8 w-8 rounded border border-hairline bg-white p-1" />}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="text-xs text-muted"
              onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], "favicon")}
            />
            {uploading === "favicon" && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="primaryColor">
              Primary color
            </label>
            <input
              id="primaryColor"
              name="primaryColor"
              type="color"
              defaultValue={initial?.primary_color ?? "#2f6bff"}
              className="h-10 w-full rounded-lg border border-hairline bg-raised"
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor="accentColor">
              Accent color
            </label>
            <input
              id="accentColor"
              name="accentColor"
              type="color"
              defaultValue={initial?.accent_color ?? "#22d3a5"}
              className="h-10 w-full rounded-lg border border-hairline bg-raised"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="supportEmail">
              Support email
            </label>
            <input
              id="supportEmail"
              name="supportEmail"
              type="email"
              defaultValue={initial?.support_email ?? ""}
              placeholder="support@youragency.com"
              className={fieldClasses}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor="supportPhone">
              Support phone
            </label>
            <input
              id="supportPhone"
              name="supportPhone"
              defaultValue={initial?.support_phone ?? ""}
              placeholder="(555) 555-5555"
              className={fieldClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses} htmlFor="primaryNiche">
            Primary niche
          </label>
          <input
            id="primaryNiche"
            name="primaryNiche"
            defaultValue={initial?.primary_niche ?? ""}
            placeholder="e.g. plumbers, dentists"
            className={fieldClasses}
          />
          <p className="mt-1 text-xs text-muted">Pre-fills Finder with your focus — not exclusive territory.</p>
        </div>

        {error && <p className="text-sm text-signal-bad">{error}</p>}
        {saved && <p className="text-sm text-signal-good">Branding saved.</p>}

        <Button type="submit">Save branding</Button>
      </form>
    </Panel>
  );
}
