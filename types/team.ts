import type { TeamDeCollectionItem, TeamEnCollectionItem } from '@nuxt/content'

export type TeamDocument =
  | TeamDeCollectionItem
  | TeamEnCollectionItem

export type TeamMember =
  NonNullable<TeamDocument['members']>[number]

export type TeamRank = 'admin' | 'team_assistant' | 'content' | 'moderator'

/** Display order of rank sections on the team page. */
export const TEAM_RANK_ORDER: TeamRank[] = [
  'admin',
  'team_assistant',
  'content',
  'moderator'
]

