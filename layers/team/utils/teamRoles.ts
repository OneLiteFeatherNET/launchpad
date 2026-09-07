/**
 * The team `role` field accepts either a single label or an array of
 * labels so a member can carry multiple sub-roles (e.g. "Entwicklung"
 * and "Bau-Team"). These helpers funnel both shapes into the form each
 * call site needs without leaking the union into the templates.
 */

type RoleField = string | string[] | undefined | null

/** Trim, drop empties, and de-duplicate the role list. Always an array. */
export function toRoleList(role: RoleField): string[] {
  if (!role) return []
  const raw = Array.isArray(role) ? role : [role]
  const seen = new Set<string>()
  const out: string[] = []
  for (const entry of raw) {
    const value = String(entry).trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

/**
 * Plain-text form for contexts that can't render multiple chips, e.g.
 * schema.org `jobTitle`, SEO descriptions, and aria labels. Joins
 * entries with " · " to mirror the existing role-separator convention.
 */
export function toRoleString(role: RoleField): string {
  return toRoleList(role).join(' · ')
}
