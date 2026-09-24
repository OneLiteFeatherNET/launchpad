import type { EventAccessMode, EventDocument, EventPhase, EventType } from '../types'
import { eventPhaseAt, isEventListedAt, isPromotedAt } from '#shared/utils/eventPhase'
import { eventDetailPath } from '#shared/utils/eventRoutes'

/**
 * What the overview and the carousel need from an event, and nothing more:
 * the full document carries the markdown body, which has no business in the
 * SSR payload of a list page.
 */
export interface EventCardData {
  slug: string
  title: string
  summary: string
  type: EventType
  phase: EventPhase
  accessMode: EventAccessMode
  startsAt: string
  endsAt?: string
  thumbnail?: string
  thumbnailAlt?: string
  path: string
  /** Name of the first place, only for past events that have results. */
  winner?: string
}

export interface GroupedEvents {
  /** The moment the phases were decided, as an ISO string. */
  now: string
  current: EventCardData[]
  upcoming: EventCardData[]
  past: EventCardData[]
}

/** How many events the home carousel shows at most, ahead of its curated slides. */
export const MAX_PROMOTED_EVENTS = 2

const time = (value: string | undefined) => (value ? Date.parse(value) : Number.NaN)

/** Name of the lowest placement number, if any. */
function winnerOf(doc: EventDocument): string | undefined {
  const placements = doc.results?.placements ?? []
  return [...placements].sort((a, b) => a.place - b.place)[0]?.name
}

export function toEventCard(doc: EventDocument, locale: string, now: Date): EventCardData {
  const phase = eventPhaseAt(doc.event, now)
  return {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    type: doc.type,
    phase,
    accessMode: doc.access?.mode ?? 'open',
    startsAt: doc.event.startsAt,
    endsAt: doc.event.endsAt,
    thumbnail: doc.thumbnail,
    thumbnailAlt: doc.thumbnailAlt,
    path: eventDetailPath(locale, doc.slug),
    winner: phase === 'past' ? winnerOf(doc) : undefined,
  }
}

/**
 * The overview's three sections at `now`. Running and announced events are
 * ordered by start, soonest first; past events by end, most recent first
 * (an event without `endsAt` is never past). Hidden and unlisted events are
 * dropped.
 */
export function groupEventsAt(docs: EventDocument[], locale: string, now: Date): GroupedEvents {
  const cards = docs
    .filter((doc) => isEventListedAt(doc.event, doc.unlisted, now))
    .map((doc) => toEventCard(doc, locale, now))
  const byStart = (a: EventCardData, b: EventCardData) => time(a.startsAt) - time(b.startsAt)
  return {
    now: now.toISOString(),
    current: cards.filter((card) => card.phase === 'running').sort(byStart),
    upcoming: cards.filter((card) => card.phase === 'announced').sort(byStart),
    past: cards
      .filter((card) => card.phase === 'past')
      .sort((a, b) => time(b.endsAt) - time(a.endsAt)),
  }
}

/**
 * The events the home carousel promotes at `now`: inside their promotion
 * window, listed, soonest start first, at most {@link MAX_PROMOTED_EVENTS}.
 * An unlisted event is never promoted, even inside its own promote window —
 * findability is the same rule everywhere (design.md D2).
 */
export function promotedEventsAt(
  docs: EventDocument[],
  locale: string,
  now: Date
): EventCardData[] {
  return docs
    .filter((doc) => (
      isEventListedAt(doc.event, doc.unlisted, now) && isPromotedAt(doc.event, doc.promote, now)
    ))
    .map((doc) => toEventCard(doc, locale, now))
    .sort((a, b) => time(a.startsAt) - time(b.startsAt))
    .slice(0, MAX_PROMOTED_EVENTS)
}
