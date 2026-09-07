// The CMS-derived document shape lives in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// This re-exports it under the same name and derives the plain shapes
// this layer's composables actually work with.
import type { TeamDocument } from '#layers/content-core'

export type { TeamDocument }

export type TeamMember =
  NonNullable<TeamDocument['members']>[number]

export type TeamRank =
  | 'admin'
  | 'teamassist'
  | 'content'
  | 'moderation'
  | 'media'
  | 'lite'

/**
 * Display order of rank sections on the team page, most senior first.
 * Mirrors the LuckPerms inheritance path (administrator → teamassist →
 * content → moderator → media → lite); `default` is a regular player and
 * not a team rank.
 */
export const TEAM_RANK_ORDER: TeamRank[] = [
  'admin',
  'teamassist',
  'content',
  'moderation',
  'media',
  'lite'
]
