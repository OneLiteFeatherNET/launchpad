import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * The rules the events schema cannot express.
 *
 * In @nuxt/content the zod schema is a column definition, not a validator (see
 * schema-columns.spec.ts). A missing `access.url` or an `endsAt` before
 * `startsAt` builds without complaint and only shows on the page — as an
 * "Apply" button that goes nowhere, or an event that is past before it began.
 *
 * Timestamps must carry an offset because they are read by a Worker running
 * in UTC: `2026-10-01T18:00` would silently mean 18:00 UTC, two hours later
 * than a German author intends in summer.
 */

type Frontmatter = Record<string, unknown>

const OFFSET = /(?:Z|[+-]\d{2}:\d{2})$/
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/

const TYPES = ['build',
'play',
'adventure',
'beta']
const ACCESS_MODES = ['open',
'signup',
'application',
'invite']
const SUBJECT_KINDS = ['gamemode',
'feature',
'offer']
const RESOURCE_KINDS = ['download',
'link',
'discord',
'schematic']

function asRecord(value: unknown): Frontmatter | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Frontmatter : undefined
}

/**
 * Every problem in one event's frontmatter, each naming the field. Pure, so
 * the fixture cases below run exactly the code the real files do.
 */
export function eventFrontmatterProblems(data: Frontmatter): string[] {
  const problems: string[] = []
  const times = new Map<string, number>()

  const timestamp = (field: string, value: unknown) => {
    if (value === undefined) return
    // `yaml` keeps unquoted timestamps as strings (YAML 1.2 core schema); a
    // Date here would mean the offset is already gone.
    if (typeof value !== 'string' || !ISO.test(value)) {
      problems.push(`${field}: not an ISO timestamp (${JSON.stringify(value)})`)
      return
    }
    if (!OFFSET.test(value)) {
      problems.push(`${field}: timestamp without timezone offset (${value})`)
      return
    }
    times.set(field, Date.parse(value))
  }

  const oneOf = (field: string, value: unknown, allowed: string[]) => {
    if (typeof value !== 'string' || !allowed.includes(value)) {
      problems.push(`${field}: must be one of ${allowed.join(' | ')} (got ${JSON.stringify(value)})`)
    }
  }

  for (const field of ['slug',
'title',
'summary']) {
    if (typeof data[field] !== 'string' || data[field] === '') problems.push(`${field}: required string`)
  }
  oneOf('type', data.type, TYPES)

  const schedule = asRecord(data.event)
  if (!schedule) {
    problems.push('event: required object with startsAt')
  } else {
    if (schedule.startsAt === undefined) problems.push('event.startsAt: required')
    timestamp('event.announceAt', schedule.announceAt)
    timestamp('event.startsAt', schedule.startsAt)
    timestamp('event.endsAt', schedule.endsAt)
  }

  const before = (earlier: string, later: string) => {
    const a = times.get(earlier)
    const b = times.get(later)
    if (a !== undefined && b !== undefined && a > b) problems.push(`${earlier} is after ${later}`)
  }
  before('event.announceAt', 'event.startsAt')
  before('event.startsAt', 'event.endsAt')

  const access = asRecord(data.access)
  if (data.access !== undefined && !access) problems.push('access: must be an object')
  if (access) {
    oneOf('access.mode', access.mode, ACCESS_MODES)
    if ((access.mode === 'signup' || access.mode === 'application') && typeof access.url !== 'string') {
      problems.push(`access.url: required when access.mode is ${access.mode}`)
    }
    timestamp('access.opens', access.opens)
    timestamp('access.closes', access.closes)
    before('access.opens', 'access.closes')
  }

  if (data.promote !== undefined && data.promote !== false) {
    const promote = asRecord(data.promote)
    if (!promote) {
      problems.push('promote: must be false or an object with from/until')
    } else {
      timestamp('promote.from', promote.from)
      timestamp('promote.until', promote.until)
      before('promote.from', 'promote.until')
    }
  }

  const subject = asRecord(data.subject)
  if (data.type === 'beta') {
    if (!subject) problems.push('subject: required when type is beta')
    else {
      oneOf('subject.kind', subject.kind, SUBJECT_KINDS)
      if (typeof subject.name !== 'string' || subject.name === '') problems.push('subject.name: required string')
    }
  }

  const build = asRecord(data.build)
  if (build) timestamp('build.submissionDeadline', build.submissionDeadline)

  if (data.testing !== undefined && data.type !== 'beta') {
    problems.push('testing: only meaningful when type is beta')
  }

  const results = asRecord(data.results)
  if (results) {
    const places = new Set<number>()
    const placements = Array.isArray(results.placements) ? results.placements : []
    placements.forEach((entry, index) => {
      const placement = asRecord(entry)
      const place = placement?.place
      if (typeof place !== 'number' || !Number.isInteger(place) || place < 1) {
        problems.push(`results.placements[${index}].place: must be a whole number from 1`)
      } else if (places.has(place)) {
        problems.push(`results.placements[${index}].place: ${place} appears twice`)
      } else {
        places.add(place)
      }
    })
    const stats = Array.isArray(results.stats) ? results.stats : []
    stats.forEach((entry, index) => {
      // An unquoted `value: 42` parses as a number; the column is a string.
      if (typeof asRecord(entry)?.value !== 'string') {
        problems.push(`results.stats[${index}].value: must be a quoted string`)
      }
    })
  }

  if (Array.isArray(data.resources)) {
    data.resources.forEach((entry, index) => {
      const resource = asRecord(entry)
      oneOf(`resources[${index}].kind`, resource?.kind, RESOURCE_KINDS)
    })
  }

  return problems
}

/** Every event document under content/events/, with its parsed frontmatter. */
function eventDocuments(): { file: string, data: Frontmatter }[] {
  return collectSourceFiles(['content/events'], ['.md'])
    .map((file) => ({ file: relativeToRepo(file), text: readFileSync(file, 'utf8') }))
    .map((doc) => ({
      file: doc.file,
      data: (parse(doc.text.slice(3, doc.text.indexOf('\n---', 3))) ?? {}) as Frontmatter,
    }))
}

const VALID: Frontmatter = {
  slug: 'herbst-bauevent',
  title: 'Herbst-Bauevent',
  summary: 'Baut den schönsten Herbstmarkt.',
  type: 'build',
  event: {
    announceAt: '2026-09-20T12:00:00+02:00',
    startsAt: '2026-10-01T18:00:00+02:00',
    endsAt: '2026-10-14T23:59:00+02:00',
  },
}

function withChange(change: (data: Frontmatter) => void): Frontmatter {
  const copy = structuredClone(VALID)
  change(copy)
  return copy
}

describe('events frontmatter', () => {
  it('accepts a minimal and a valid entry', () => {
    expect(eventFrontmatterProblems(VALID)).toEqual([])
    expect(eventFrontmatterProblems({
      slug: 'x',
      title: 'X',
      summary: 'X',
      type: 'play',
      event: { startsAt: '2026-10-01T18:00:00Z' },
    })).toEqual([])
  })

  it.each([
    ['timestamp without offset',
(d: Frontmatter) => { (d.event as Frontmatter).startsAt = '2026-10-01T18:00' },
'event.startsAt: timestamp without timezone offset'],
    ['endsAt before startsAt',
(d: Frontmatter) => { (d.event as Frontmatter).endsAt = '2026-09-30T18:00:00+02:00' },
'event.startsAt is after event.endsAt'],
    ['announceAt after startsAt',
(d: Frontmatter) => { (d.event as Frontmatter).announceAt = '2026-10-02T18:00:00+02:00' },
'event.announceAt is after event.startsAt'],
    ['signup without url',
(d: Frontmatter) => { d.access = { mode: 'signup' } },
'access.url: required when access.mode is signup'],
    ['application without url',
(d: Frontmatter) => { d.access = { mode: 'application' } },
'access.url: required when access.mode is application'],
    ['unknown access mode',
(d: Frontmatter) => { d.access = { mode: 'rank' } },
'access.mode: must be one of'],
    ['beta without subject',
(d: Frontmatter) => { d.type = 'beta' },
'subject: required when type is beta'],
    ['unknown subject kind',
(d: Frontmatter) => { d.type = 'beta'; d.subject = { kind: 'map', name: 'X' } },
'subject.kind: must be one of'],
    ['unknown type',
(d: Frontmatter) => { d.type = 'tournament' },
'type: must be one of'],
    ['testing on a non-beta event',
(d: Frontmatter) => { d.testing = { focus: ['x'] } },
'testing: only meaningful when type is beta'],
    ['placement below 1',
(d: Frontmatter) => { d.results = { placements: [{ place: 0, name: 'X' }] } },
'results.placements[0].place: must be a whole number from 1'],
    ['duplicate placement',
(d: Frontmatter) => { d.results = { placements: [{ place: 1, name: 'A' }, { place: 1, name: 'B' }] } },
'results.placements[1].place: 1 appears twice'],
    ['unquoted stat value',
(d: Frontmatter) => { d.results = { stats: [{ label: 'Teilnehmer', value: 42 }] } },
'results.stats[0].value: must be a quoted string'],
    ['promote window without offset',
(d: Frontmatter) => { d.promote = { from: '2026-09-25' } },
'promote.from: not an ISO timestamp'],
  ])('rejects %s', (_name, change, expected) => {
    const problems = eventFrontmatterProblems(withChange(change))
    expect(problems.some((problem) => problem.startsWith(expected))).toBe(true)
  })

  it('accepts promote: false', () => {
    expect(eventFrontmatterProblems(withChange((d) => { d.promote = false }))).toEqual([])
  })

  it('holds every event file to these rules', () => {
    const failures = eventDocuments()
      .flatMap((doc) => eventFrontmatterProblems(doc.data).map((problem) => `${doc.file}: ${problem}`))
    expect(failures.sort()).toEqual([])
  })
})
