import type { TeamDeCollectionItem, TeamEnCollectionItem } from '@nuxt/content'

export type TeamDocument =
  | TeamDeCollectionItem
  | TeamEnCollectionItem

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

