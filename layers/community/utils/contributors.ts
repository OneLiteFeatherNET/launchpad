import { eventPhaseAt, isEventListedAt } from '#shared/utils/eventPhase'
import { eventDetailPath } from '#shared/utils/eventRoutes'
import { personAnchor } from '#shared/utils/personAnchor'
import type {
  CommunityEventSource,
  CommunityOverview,
  CommunityPoiSource,
  CommunitySupporterSource,
  Contribution,
  Contributor
} from '../types'

export type { CommunityEventSource, CommunityPoiSource, CommunitySupporterSource }

export interface CommunityOverviewInput {
  pois: CommunityPoiSource[]
  events: CommunityEventSource[]
  supporters?: CommunitySupporterSource[]
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
 * as placed in an event that is listed and over, plus Lite supporters. One
 * person appears once, whatever the spelling, with every contribution in the
 * order given (POIs, events, then supporter); a supporter joins the person
 * whose `mcName` or name matches theirs.
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
    const entry: Contributor = {
      key,
      name: person.name.trim(),
      anchor: personAnchor(key),
      contributions: [contribution]
    }
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

  const overview: CommunityOverview = {
    teamSize: input.teamSize,
    buildCount: input.pois.length,
    contributors: [...people.values()].sort(byContributionsThenName)
  }

  return input.supporters ? withSupporters(overview, input.supporters) : overview
}

/**
 * The overview with Lite supporters added. A supporter joins the person whose
 * `mcName` or name matches theirs, else becomes a new person; the input is
 * left untouched, so supporters can arrive after the content queries did.
 */
export function withSupporters(
  overview: CommunityOverview,
  supporters: CommunitySupporterSource[]
): CommunityOverview {
  const people = new Map<string, Contributor>()
  const byName = new Map<string, Contributor>()
  const index = (person: Contributor) => {
    byName.set(person.name.toLowerCase(), person)
    if (person.mcName) byName.set(person.mcName.trim().toLowerCase(), person)
  }
  for (const person of overview.contributors) {
    const copy = { ...person, contributions: [...person.contributions] }
    people.set(copy.key, copy)
    index(copy)
  }

  for (const supporter of supporters) {
    const name = supporter.name.trim()
    const lowered = name.toLowerCase()
    if (!lowered) continue
    let person = people.get(lowered) ?? byName.get(lowered)
    if (!person) {
      person = { key: lowered, name, anchor: personAnchor(lowered), contributions: [] }
      people.set(lowered, person)
      index(person)
    }
    if (person.contributions.some((c) => c.kind === 'supporter')) continue
    person.contributions.push({ kind: 'supporter', path: supporter.profile })
    person.anchor = personAnchor(name)
    if (supporter.image && !person.avatarUrl) person.avatarUrl = supporter.image
  }

  return { ...overview, contributors: [...people.values()].sort(byContributionsThenName) }
}
