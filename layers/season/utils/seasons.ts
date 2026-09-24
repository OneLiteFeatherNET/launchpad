import type { ActiveSeason, Season, SeasonDay } from '../types'

/**
 * Seasonal registry and the rule that picks one.
 *
 * Pure functions only — no Nuxt, no browser, no clock of its own. The caller
 * passes the date in, which is what lets `useSeason` resolve once on the
 * server and lets the tests pin a moment.
 */

/** The reference clock. A Cloudflare Worker runs in UTC; the audience does not. */
const TIME_ZONE = 'Europe/Berlin'

/**
 * Opens well before 31 October so the site is dressed for the run-up rather
 * than for the single day, and closes on 2 November — All Souls' Day, and one
 * quiet day of overlap so nobody has to deploy at midnight.
 */
export const HALLOWEEN: Season = {
  id: 'halloween',
  start: { month: 10, day: 20 },
  end: { month: 11, day: 2 },
  decor: true,
  themeColor: { light: '#fff7fe', dark: '#161218' },
  logo: 'images/seasons/halloween/logo.svg',
  favicon: '/images/seasons/halloween/favicon.svg',
}

export const SEASONS: readonly Season[] = [HALLOWEEN]

/** Override value that switches every season off, whatever the date says. */
export const SEASON_OFF = 'none'

/**
 * `month` and `day` for `date` as they read on a wall clock in Berlin. `Intl`
 * converts zones without a bundled database, and the Workers runtime has it.
 */
function calendarDay(date: Date): SeasonDay {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const read = (type: 'month' | 'day') => Number(parts.find((part) => part.type === type)?.value)
  return { month: read('month'), day: read('day') }
}

/** Month and day collapsed into one sortable number. */
function ordinal(day: SeasonDay): number {
  return day.month * 100 + day.day
}

/** Whether `day` falls inside the season's window, both ends inclusive. */
function covers(season: Season, day: SeasonDay): boolean {
  const current = ordinal(day)
  const start = ordinal(season.start)
  const end = ordinal(season.end)
  return start <= end
    ? current >= start && current <= end
    : current >= start || current <= end
}

export interface ResolveSeasonOptions {
  /** The moment to resolve for. */
  date: Date
  /**
   * Values that force a season on (`<id>`) or off (`none`) ahead of the
   * calendar, highest precedence first — the query parameter, then the
   * environment variable. The first recognised value wins. They come from
   * outside, so anything may arrive: an unknown or empty value is skipped
   * rather than read as "no season", which keeps a typo from silently
   * undressing the site during the season.
   */
  overrides?: readonly (string | null | undefined)[]
  /** Defaults to the registry; injectable so tests can exercise odd windows. */
  seasons?: readonly Season[]
}

export function resolveSeason(options: ResolveSeasonOptions): ActiveSeason {
  const { date, overrides = [], seasons = SEASONS } = options

  for (const override of overrides) {
    if (override === SEASON_OFF) return null
    const forced = seasons.find((season) => season.id === override)
    if (forced) return forced
  }

  const today = calendarDay(date)
  return seasons.find((season) => covers(season, today)) ?? null
}

/**
 * The season a `?season=` preview asks for, from a URL search string.
 * `undefined` means "no preview": no parameter, or a value that is neither a
 * season id nor `none` — a typo then leaves the server's decision alone
 * instead of re-deciding by the browser's clock. `null` means `none`.
 */
export function previewSeason(
  search: string,
  seasons: readonly Season[] = SEASONS,
): ActiveSeason | undefined {
  const value = new URLSearchParams(search).get('season')
  if (value === SEASON_OFF) return null
  return seasons.find((season) => season.id === value)
}
