/**
 * A member profile with neither bio nor slogan renders only name and role —
 * Google reports it as a soft 404. Shared by the profile page (noindex) and
 * the Nitro sitemap source (omit); keep this file top level, see AGENTS.md.
 */
export interface TeamProfileText {
  bio?: string | null
  slogan?: string | null
}

export function isThinTeamProfile(member: TeamProfileText): boolean {
  return !member.bio?.trim() && !member.slogan?.trim()
}
