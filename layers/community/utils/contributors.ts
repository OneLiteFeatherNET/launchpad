import { eventPhaseAt, isEventListedAt } from '#shared/utils/eventPhase'
import { eventDetailPath } from '#shared/utils/eventRoutes'
import type {
  CommunityEventSource,
  CommunityOverview,
  CommunityPoiSource,
  Contribution,
  Contributor
} from '../types'

export type { CommunityEventSource, CommunityPoiSource }

export interface CommunityOverviewInput {
  pois: CommunityPoiSource[]
  events: CommunityEventSource[]
  teamSize: number
  locale: string
  now: Date
}

type Named = { name: string, mcName?: string }

const keyOf = (person: Named): string => (person.mcName || person.name).trim().toLowerCase()

const byContributionsThenName = (a: Contributor, b: Contributor): number => {
  return b.contributions.length - a.contributions.length || a.name.localeCompare(b.name)
}

/**
 * Who is on the wall: people the site already names as builders of a POI or
 * as placed in an event that is listed and over. One person appears once,
 * whatever the spelling, with every contribution in the order given (POIs
 * before events).
 */
export function buildCommunityOverview(input: CommunityOverviewInput): CommunityOverview {
  const people = new Map<string, Contributor>()

  const add = (person: Named, contribution: Contribution) => {
    const key = keyOf(person)
    if (!key) return
    const existing = people.get(key)
    if (existing) {
      const repeated = existing.contributions
        .some((c) => c.kind === contribution.kind && c.path === contribution.path)
      if (!repeated) existing.contributions.push(contribution)
      return
    }
    const entry: Contributor = { key, name: person.name.trim(), contributions: [contribution] }
    if (person.mcName) entry.mcName = person.mcName
    people.set(key, entry)
  }

  for (const poi of input.pois) {
    const contribution: Contribution = {
      kind: 'build',
      title: poi.title,
      path: `/${input.locale}/community-poi/${poi.slug}`
    }
    for (const builder of poi.builders ?? []) add(builder, contribution)
  }

  for (const event of input.events) {
    if (!isEventListedAt(event.event, event.unlisted, input.now)) continue
    if (eventPhaseAt(event.event, input.now) !== 'past') continue
    for (const placement of event.results?.placements ?? []) {
      add(placement, {
        kind: 'event',
        title: event.title,
        path: eventDetailPath(input.locale, event.slug),
        place: placement.place
      })
    }
  }

  const contributors = [...people.values()].sort(byContributionsThenName)

  return { teamSize: input.teamSize, buildCount: input.pois.length, contributors }
}
