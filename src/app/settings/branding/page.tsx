import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { SectionHeading } from "@/components/ui";
import { BrandingForm } from "./branding-form";

export default async function BrandingSettingsPage() {
  const { supabase, role, organizationId } = await requireAdminPage();

  const { data: branding } = await supabase
    .from("org_branding")
    .select("brand_name, logo_url, favicon_url, primary_color, accent_color, support_email, support_phone, primary_niche")
    .eq("organization_id", organizationId)
    .maybeSingle();

  return (
    <PageShell role={role}>
      <SectionHeading
        eyebrow="Settings"
        title="Branding"
        description="What your own clients see: the name, logo, colors, and contact info that appear on every site you generate and every email they get from you. Your own dashboard login keeps the WebGenie name for now."
      />
      <BrandingForm organizationId={organizationId} initial={branding ?? null} />
    </PageShell>
  );
}
