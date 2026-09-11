/**
 * Plain {{var}} substitution for playbook scripts. Deliberately dumb: no
 * conditionals, no derived facts. Every value passed in must already be
 * real (a verified observation, the caller's own name, a resolved caller
 * identity) -- this function never invents wording, it only assembles
 * strings the caller already has. A variable with no supplied value is
 * rendered as a visible bracketed placeholder (e.g. "[verified
 * observation]") rather than silently disappearing, so the UI surfaces
 * what's still missing instead of reading as a confident but empty claim.
 */
export type PlaybookRenderVars = Record<string, string | null | undefined>;

function humanizePlaceholder(key: string): string {
  return `[${key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()}]`;
}

export function renderTemplate(template: string, vars: PlaybookRenderVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = vars[key];
    return value && value.trim().length > 0 ? value : humanizePlaceholder(key);
  });
}
