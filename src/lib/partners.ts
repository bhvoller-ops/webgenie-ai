/**
 * Shared by the admin "Add a partner" action (actions.ts) and the public
 * self-serve signup route (/api/partner-signup) — one slugify rule for
 * referral codes, not two copies drifting apart.
 */
export function buildReferralCode(name: string, custom?: string) {
  const source = custom && custom.trim().length > 0 ? custom : name;
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || `partner-${Date.now()}`
  );
}
