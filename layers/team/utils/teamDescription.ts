/**
 * Meta description and title for a team profile. A slogan like "Modrinth."
 * describes nothing, so it is only used when it is a real sentence.
 */

import { toRoleString, type RoleField } from './teamRoles'

export const SLOGAN_MIN_LENGTH = 50

export interface TeamDescriptionMember {
  name: string
  role?: RoleField
  bio?: string | null
  slogan?: string | null
}

export interface TeamDescriptionCopy {
  withArea: (name: string, area: string) => string
  plain: (name: string) => string
}

export function isDescriptiveSlogan(slogan: string | null | undefined): boolean {
  const text = slogan?.trim() ?? ''
  return text.length >= SLOGAN_MIN_LENGTH && /[.!?]$/.test(text)
}

export function teamProfileDescription(
  member: TeamDescriptionMember,
  copy: TeamDescriptionCopy,
  rankLabel?: string | null
): string {
  const bio = member.bio?.trim()
  if (bio) return bio
  const slogan = member.slogan?.trim()
  if (slogan && isDescriptiveSlogan(slogan)) return slogan
  const area = toRoleString(member.role) || rankLabel?.trim() || ''
  return area ? copy.withArea(member.name, area) : copy.plain(member.name)
}

/** The role, when the member has one, is the only extra title word. */
export function teamProfileTitle(member: TeamDescriptionMember): string {
  const role = toRoleString(member.role)
  return role ? `${member.name} – ${role}` : member.name
}
