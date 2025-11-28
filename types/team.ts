import type { TeamDeCollectionItem, TeamEnCollectionItem } from '@nuxt/content'

export type TeamDocument =
  | TeamDeCollectionItem
  | TeamEnCollectionItem

export type TeamMember =
  NonNullable<TeamDocument['members']>[number]

