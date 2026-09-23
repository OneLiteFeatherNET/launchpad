/**
 * Formatting behind DateRange.vue, kept pure so it can be tested without a
 * component and so server and browser produce the same string: every call
 * names its time zone explicitly instead of inheriting the machine's (UTC on
 * the Worker, anything in a visitor's browser).
 */

export interface FormattedDateRange {
  /** ISO instants for `<time datetime>`. */
  startIso: string
  endIso?: string
  /** Visible text of the start, and of the end when there is one. */
  startText: string
  endText?: string
  /** Whether start and end fall on the same calendar day in `timeZone`. */
  sameDay: boolean
}

/** BCP 47 tag for a site locale; `en` uses British English for `CEST`-style zone names. */
export function intlLocale(locale: string): string {
  if (locale === 'de') return 'de-DE'
  if (locale === 'en') return 'en-GB'
  return locale
}

function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

/**
 * Start and optional end, formatted in `timeZone` for `locale`. With
 * `withTime`, the zone abbreviation is appended once, to the last time
 * shown; on a single day the date is named only once.
 */
export function formatDateRange(options: {
  start: string | Date
  end?: string | Date
  locale: string
  timeZone: string
  withTime?: boolean
}): FormattedDateRange | null {
  const { locale, timeZone, withTime = true } = options
  const start = new Date(options.start)
  if (Number.isNaN(start.getTime())) return null
  const endCandidate = options.end === undefined ? undefined : new Date(options.end)
  const end = endCandidate && !Number.isNaN(endCandidate.getTime()) ? endCandidate : undefined

  const tag = intlLocale(locale)
  const date = new Intl.DateTimeFormat(tag, { timeZone, dateStyle: 'medium' })
  const time = new Intl.DateTimeFormat(tag, { timeZone, hour: '2-digit', minute: '2-digit' })
  const timeWithZone = new Intl.DateTimeFormat(tag, { timeZone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  const sameDay = end !== undefined && dayKey(start, timeZone) === dayKey(end, timeZone)

  let startText: string
  let endText: string | undefined
  if (!withTime) {
    startText = date.format(start)
    endText = end && !sameDay ? date.format(end) : undefined
  } else if (!end) {
    startText = `${date.format(start)}, ${timeWithZone.format(start)}`
  } else if (sameDay) {
    startText = `${date.format(start)}, ${time.format(start)}`
    endText = timeWithZone.format(end)
  } else {
    startText = `${date.format(start)}, ${time.format(start)}`
    endText = `${date.format(end)}, ${timeWithZone.format(end)}`
  }

  return {
    startIso: start.toISOString(),
    endIso: end?.toISOString(),
    startText,
    endText,
    sameDay,
  }
}
