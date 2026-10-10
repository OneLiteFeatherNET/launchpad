import type { EventPhase } from '../types'

/**
 * schema.org eventStatus for an event's phase. schema.org has no "completed"
 * value, so a past event gets none rather than a false "scheduled".
 */
export function eventSchemaStatus(phase: EventPhase): string | undefined {
  return phase === 'past' ? undefined : 'https://schema.org/EventScheduled'
}
