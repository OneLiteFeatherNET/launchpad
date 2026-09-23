// The CMS-derived document shape lives in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// Everything below derives from it by indexed access, as community-poi does.
import type { EventDocument } from '#layers/content-core'

export type { EventDocument }

/** A single event, as the composables and components consume it. */
export type EventEntry = EventDocument

export const EVENT_TYPES = [
  'build',
  'play',
  'adventure',
  'beta'
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_ACCESS_MODES = [
  'open',
  'signup',
  'application',
  'invite'
] as const
export type EventAccessMode = (typeof EVENT_ACCESS_MODES)[number]

export const EVENT_SUBJECT_KINDS = [
  'gamemode',
  'feature',
  'offer'
] as const
export type EventSubjectKind = (typeof EVENT_SUBJECT_KINDS)[number]

export const EVENT_PHASES = [
  'hidden',
  'announced',
  'running',
  'past'
] as const
/** Mirrors the return type of `eventPhaseAt` in shared/utils/eventPhase.ts. */
export type EventPhase = (typeof EVENT_PHASES)[number]

export type EventSchedule = EventDocument['event']
export type EventAccess = NonNullable<EventDocument['access']>
export type EventJoin = NonNullable<EventDocument['join']>
export type EventSubject = NonNullable<EventDocument['subject']>
export type EventBuildInfo = NonNullable<EventDocument['build']>
export type EventTesting = NonNullable<EventDocument['testing']>
export type EventResults = NonNullable<EventDocument['results']>
export type EventPlacement = NonNullable<EventResults['placements']>[number]
export type EventStat = NonNullable<EventResults['stats']>[number]
export type EventPlayInfo = NonNullable<EventDocument['play']>
export type EventAdventureInfo = NonNullable<EventDocument['adventure']>
export type EventImage = NonNullable<EventDocument['gallery']>[number]
export type EventResource = NonNullable<EventDocument['resources']>[number]
export type EventAlternateHeader = NonNullable<EventDocument['alternates']>[number]
