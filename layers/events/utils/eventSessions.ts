import type { EventSessionSlot } from '../types'

/**
 * The recurring session of an event (the `sessions` frontmatter), as pure
 * functions: no clock, no Vue — the caller passes `now`.
 */

export interface SessionRule {
  first: string
  durationMinutes: number
  repeat?: 'weekly'
}

const ZONE = 'Europe/Berlin'
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const WEEK = 7 * DAY

const wallClock = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
})

interface WallTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function wallOf(instant: number): WallTime {
  const parts: Record<string, number> = {}
  for (const part of wallClock.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value)
  }
  return {
    year: parts.year!,
    month: parts.month!,
    day: parts.day!,
    hour: parts.hour!,
    minute: parts.minute!,
    second: parts.second!
  }
}

/** A Berlin wall time written as if it were UTC, `dayShift` calendar days later. */
function wallMs(wall: WallTime, dayShift = 0): number {
  const { year, month, day, hour, minute, second } = wall
  return Date.UTC(year, month - 1, day + dayShift, hour, minute, second)
}

const offsetAt = (instant: number) => wallMs(wallOf(instant)) - Math.floor(instant / 1000) * 1000

/**
 * The instant at which Berlin shows `wall` (given as UTC ms). The zone's
 * offset a day before and a day after is tried and checked back. In the
 * autumn overlap the earlier instant wins; in the spring gap the offset from
 * before the gap applies.
 */
function berlinWallTimeToInstant(wall: number): number {
  const before = offsetAt(wall - DAY)
  const after = offsetAt(wall + DAY)
  const candidates = [before, after]
    .map((offset) => wall - offset)
    .filter((instant) => offsetAt(instant) === wall - instant)
  return candidates.length ? Math.min(...candidates) : wall - before
}

function parse(value: string | undefined): number | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? undefined : time
}

/**
 * The session running at `now`, or else the next one to start; `null` when
 * none is left. A session runs from exactly its start and is over at exactly
 * its end. With `repeat: weekly`, every week's session starts at the same
 * Berlin wall-clock time as `first`, even across a change of clocks. No
 * session starts at or after `until` (the event's `endsAt`).
 */
export function nextSessionAt(
  rule: SessionRule,
  until: string | undefined,
  now: Date | number
): EventSessionSlot | null {
  const nowMs = typeof now === 'number' ? now : now.getTime()
  const firstMs = parse(rule.first)
  if (firstMs === undefined) return null
  const limit = parse(until)
  const length = rule.durationMinutes * MINUTE
  const weekly = rule.repeat === 'weekly'

  const first = wallOf(firstMs)
  const startOf = (week: number) => (
    week === 0 ? firstMs : berlinWallTimeToInstant(wallMs(first, 7 * week))
  )

  // A week's start drifts at most an hour from `first + week * 7 days`, so
  // beginning one week early cannot skip a session; the loop ends within a few steps.
  let week = weekly ? Math.max(0, Math.floor((nowMs - firstMs) / WEEK) - 1) : 0
  for (let step = 0; step < 4; step++, week++) {
    const start = startOf(week)
    if (limit !== undefined && start >= limit) return null
    if (start + length > nowMs) {
      return {
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(start + length).toISOString()
      }
    }
    if (!weekly) return null
  }
  return null
}

/** Days, hours and minutes in `ms`, minutes rounded up; zero for zero or less. */
export function countdownParts(ms: number): { days: number, hours: number, minutes: number } {
  const total = Math.max(0, Math.ceil(ms / MINUTE))
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60
  }
}
