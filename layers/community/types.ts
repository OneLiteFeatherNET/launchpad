import type { EventScheduleFields } from '#shared/utils/eventPhase'

/** A community POI as far as the wall needs it; structurally the repository's row. */
export interface CommunityPoiSource {
  slug: string
  title: string
  builders?: { name: string, mcName?: string }[]
}

/** An event as far as the wall needs it; structurally the repository's row. */
export interface CommunityEventSource {
  slug: string
  title: string
  unlisted?: boolean
  event: EventScheduleFields
  results?: { placements?: { place: number, name: string, mcName?: string }[] }
}

/** A Lite supporter as far as the wall needs it; structurally the loader's row. */
export interface CommunitySupporterSource {
  name: string
  image: string | null
  profile: string
}

export type Contribution =
  | { kind: 'build', title: string, path: string }
  | { kind: 'event', title: string, path: string, place: number }
  | { kind: 'supporter', path: string }

export interface Contributor {
  /** Dedupe key: lower-cased `mcName`, else lower-cased name. */
  key: string
  name: string
  mcName?: string
  /** Fragment id of the card; follows the supporter's name when there is one. */
  anchor: string
  /** A supporter's avatar; the wall prefers the Minecraft head when there is an `mcName`. */
  avatarUrl?: string
  contributions: Contribution[]
}

export interface CommunityOverview {
  teamSize: number
  buildCount: number
  contributors: Contributor[]
}

export interface CommunityNumbers {
  discordMembers: number | null
  teamSize: number
  buildCount: number
  contributorCount: number
  supporters: number | null
}
