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

export type Contribution =
  | { kind: 'build', title: string, path: string }
  | { kind: 'event', title: string, path: string, place: number }

export interface Contributor {
  /** Dedupe key: lower-cased `mcName`, else lower-cased name. */
  key: string
  name: string
  mcName?: string
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
