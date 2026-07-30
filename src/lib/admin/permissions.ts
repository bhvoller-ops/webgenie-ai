export const roles = ["owner", "admin", "editor", "viewer"] as const;
export type OrganizationRole = (typeof roles)[number];
export type Permission = "billing:manage" | "team:manage" | "api_keys:manage" | "projects:write" | "projects:read" | "audit:read";
const matrix: Record<OrganizationRole, Permission[]> = {
  owner: ["billing:manage","team:manage","api_keys:manage","projects:write","projects:read","audit:read"],
  admin: ["team:manage","api_keys:manage","projects:write","projects:read","audit:read"],
  editor: ["projects:write","projects:read"],
  viewer: ["projects:read"]
};
export function can(role: string, permission: Permission): boolean { return (matrix[role as OrganizationRole] ?? []).includes(permission); }
