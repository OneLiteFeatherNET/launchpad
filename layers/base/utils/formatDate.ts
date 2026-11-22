/**
 * Date formatting that does not depend on the machine's time zone, so the
 * Worker (UTC) and a visitor's browser produce the same text.
 *
 * A calendar date (frontmatter `pubDate`, parsed as UTC midnight) is formatted
 * in UTC: any zone west of it would show the previous day. A real instant (an
 * API timestamp, an event start) is formatted in Europe/Berlin, the zone the
 * events layer uses.
 */

type DateInput = string | number | Date | null | undefined
type FormatOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone'>

function format(
  value: DateInput,
  locale: string,
  timeZone: string,
  options?: FormatOptions,
): string {
  if (value === null || value === undefined || value === '') return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date)
}

export function formatCalendarDate(
  value: DateInput,
  locale: string,
  options?: FormatOptions,
): string {
  return format(value, locale, 'UTC', options)
}

export function formatInstant(
  value: DateInput,
  locale: string,
  options?: FormatOptions,
): string {
  return format(value, locale, 'Europe/Berlin', options)
}
