import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { eventSchemaStatus } from '../../layers/events/utils/eventSchemaStatus'
import { repoRoot } from '../helpers/sources'

const SCHEDULED = 'https://schema.org/EventScheduled'

describe('eventSchemaStatus', () => {
  it.each([
    'hidden',
    'announced',
    'running'
  ] as const)('marks a %s event as scheduled', (phase) => {
    expect(eventSchemaStatus(phase)).toBe(SCHEDULED)
  })

  it('claims no status for a past event', () => {
    // schema.org has no "completed" status; EventScheduled would be a false claim.
    expect(eventSchemaStatus('past')).toBeUndefined()
  })
})

describe('event detail page eventStatus wiring', () => {
  const source = readFileSync(join(repoRoot, 'pages/events/[...slug].vue'), 'utf8')

  it('takes the status from the phase instead of hard-coding it', () => {
    expect(source).toContain('eventStatus: eventSchemaStatus(phase.value)')
    expect(source).not.toContain('EventScheduled')
  })
})
