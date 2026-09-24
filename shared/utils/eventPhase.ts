/**
 * When an event is visible, promoted and open for sign-up — decided from its
 * own timestamps and one given moment.
 *
 * Lives in shared/utils because two runtimes need the identical rule: the
 * pages (through the events layer's composables) and the Nitro sitemap source
 * in server/api/__sitemap__/events.ts. Nuxt auto-imports this directory on
 * both sides; it is scanned top level only, so this file must stay here and
 * not move into a subfolder.
 *
 * Deliberately free of Vue and H3, and of `Date.now()`: the caller decides
 * what "now" is, so the app can fix it once on the server and hand the result
 * to the client instead of recomputing it there.
 *
 * `unlisted` and the phase are independent axes: the phase describes the
 * schedule, `unlisted` describes findability. `isEventListedAt` and
 * `isEventReachableAt` combine them for the two places that need it — see
 * their own docs below.
 */

export type EventPhase = 'hidden' | 'announced' | 'running' | 'past'

export interface EventScheduleFields {
  announceAt?: string
  startsAt: string
  endsAt?: string
}

export type EventPromoteField = false | { from?: string, until?: string } | undefined

export interface EventAccessWindowFields {
  opens?: string
  closes?: string
}

type Moment = Date | number

const toTime = (moment: Moment): number => (typeof moment === 'number' ? moment : moment.getTime())

/** Milliseconds since epoch, or undefined for a missing or unparsable value. */
function parseTime(value: string | undefined): number | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? undefined : time
}

/**
 * The event's phase at `now`. Boundaries belong to the later phase: at
 * exactly `startsAt` an event is running, at exactly `endsAt` it is past.
 * Without `announceAt` it stays hidden until it starts; without `endsAt` it
 * runs indefinitely. An unparsable `startsAt` keeps it hidden rather than
 * publishing something whose schedule nobody can read.
 */
export function eventPhaseAt(schedule: EventScheduleFields, now: Moment): EventPhase {
  const at = toTime(now)
  const startsAt = parseTime(schedule.startsAt)
  if (startsAt === undefined) return 'hidden'
  const endsAt = parseTime(schedule.endsAt)
  if (endsAt !== undefined && at >= endsAt) return 'past'
  if (at >= startsAt) return 'running'
  const announceAt = parseTime(schedule.announceAt)
  if (announceAt !== undefined && at >= announceAt) return 'announced'
  return 'hidden'
}

/** Whether the event is visible anywhere at `now`. */
export function isEventVisibleAt(schedule: EventScheduleFields, now: Moment): boolean {
  return eventPhaseAt(schedule, now) !== 'hidden'
}

/**
 * Whether the event belongs in the overview, the carousel or the sitemap at
 * `now`. `unlisted` regulates findability; the schedule (via `eventPhaseAt`)
 * regulates the phase — the two are independent axes, so an unlisted event is
 * never listed even once it would otherwise be visible.
 */
export function isEventListedAt(
  schedule: EventScheduleFields,
  unlisted: boolean | undefined,
  now: Moment
): boolean {
  return !unlisted && isEventVisibleAt(schedule, now)
}

/**
 * Whether the event's detail page must answer with content rather than 404
 * at `now`. An unlisted event is always reachable, regardless of phase; a
 * public event is reachable exactly when it is visible.
 */
export function isEventReachableAt(
  schedule: EventScheduleFields,
  unlisted: boolean | undefined,
  now: Moment
): boolean {
  return Boolean(unlisted) || isEventVisibleAt(schedule, now)
}

/**
 * Whether the event belongs in the home carousel at `now`. The window
 * defaults to the event's own run (`startsAt` to `endsAt`); `from` and
 * `until` override either end independently, and `false` switches promotion
 * off. A hidden event is never promoted, whatever the window says.
 */
export function isPromotedAt(
  schedule: EventScheduleFields,
  promote: EventPromoteField,
  now: Moment
): boolean {
  if (promote === false || !isEventVisibleAt(schedule, now)) return false
  const at = toTime(now)
  const from = parseTime(promote?.from) ?? parseTime(schedule.startsAt)
  const until = parseTime(promote?.until) ?? parseTime(schedule.endsAt)
  if (from === undefined || at < from) return false
  return until === undefined || at < until
}

/**
 * Whether sign-up or application is open at `now`. No window means always
 * open; either end may be given alone.
 */
export function isAccessOpenAt(window: EventAccessWindowFields | undefined, now: Moment): boolean {
  const at = toTime(now)
  const opens = parseTime(window?.opens)
  const closes = parseTime(window?.closes)
  if (opens !== undefined && at < opens) return false
  if (closes !== undefined && at >= closes) return false
  return true
}
