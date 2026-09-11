import { HOME_SERVICES_BASE_CONFIG } from "./home-services-config";
import { ROOFING_CONFIG } from "./roofing-config";
import type { PlaybookConfig } from "./types";

/** Prospect.industry values (lib/sitegen/finder-taxonomy.ts) mapped to a specialized playbook config, when one exists. */
const INDUSTRY_CONFIGS: Record<string, PlaybookConfig> = {
  roofer: ROOFING_CONFIG
};

/**
 * Resolve a playbook config for a real prospect's industry. Falls back to
 * the generic Home Services foundation for any industry without its own
 * specialization -- the whole point of the config-pattern requirement is
 * that adding HVAC/plumbing/etc. later means adding one entry here plus a
 * small override file, never touching this function's shape or the UI.
 */
export function resolvePlaybookConfig(industryKey: string | null | undefined): PlaybookConfig {
  if (industryKey && INDUSTRY_CONFIGS[industryKey]) return INDUSTRY_CONFIGS[industryKey];
  return HOME_SERVICES_BASE_CONFIG;
}
