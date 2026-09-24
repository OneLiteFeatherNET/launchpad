// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import CopyButton from '../../layers/base/components/CopyButton.vue'
import DateRange from '../../layers/base/components/DateRange.vue'
import EmptyState from '../../layers/base/components/EmptyState.vue'
import M3Button from '../../layers/base/components/M3Button.vue'
import M3Card from '../../layers/base/components/M3Card.vue'
import M3CardLink from '../../layers/base/components/M3CardLink.vue'
import M3Chip from '../../layers/base/components/M3Chip.vue'
import EventAccessChip from '../../layers/events/components/EventAccessChip.vue'
import EventBetaDetails from '../../layers/events/components/EventBetaDetails.vue'
import EventBuildDetails from '../../layers/events/components/EventBuildDetails.vue'
import EventCard from '../../layers/events/components/EventCard.vue'
import EventJoinBlock from '../../layers/events/components/EventJoinBlock.vue'
import EventPhaseChip from '../../layers/events/components/EventPhaseChip.vue'
import EventSection from '../../layers/events/components/EventSection.vue'
import EventTestingBlock from '../../layers/events/components/EventTestingBlock.vue'
import type { EventDocument } from '../../layers/events/types'
import type { EventCardData } from '../../layers/events/utils/eventLists'

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const SectionHeading = defineComponent({
  props: { id: String, level: Number },
  setup(props, { slots }) {
    return () => h(`h${props.level ?? 2}`, { id: props.id }, slots.default?.())
  },
})

const global = {
  plugins: [createI18n<false>({ legacy: false, locale: 'de', messages: { de, en } })],
  stubs: { NuxtLink, NuxtPicture: true, IconFa: true, SectionHeading },
  components: {
    M3Button,
    M3Card,
    M3CardLink,
    M3Chip,
    DateRange,
    EmptyState,
    CopyButton,
    EventCard,
    EventPhaseChip,
    EventAccessChip,
  },
}

const card: EventCardData = {
  slug: 'herbst-bauevent',
  title: 'Herbst-Bauevent',
  summary: 'Baut den schönsten Herbstmarkt.',
  type: 'build',
  phase: 'running',
  accessMode: 'application',
  startsAt: '2026-10-01T18:00:00+02:00',
  endsAt: '2026-10-14T23:59:00+02:00',
  path: '/de/events/herbst-bauevent',
}

const event = (overrides: Partial<EventDocument> = {}) => ({
  slug: 'x',
  title: 'X',
  summary: 'X',
  type: 'build',
  event: { startsAt: '2026-10-01T18:00:00+02:00' },
  ...overrides,
}) as EventDocument

describe('EventCard', () => {
  it('is one link with one tab stop and labels without button roles', () => {
    const wrapper = mount(EventCard, { props: { card }, global })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('href')).toBe('/de/events/herbst-bauevent')
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.findAll('[role="button"]')).toHaveLength(0)
    const text = wrapper.text()
    for (const label of ['Bau-Event',
'Läuft',
'Bewerbung',
'Baut den schönsten Herbstmarkt.']) expect(text).toContain(label)
    expect(wrapper.findAll('time')).toHaveLength(2)
  })

  it('leaves the access label out for open events', () => {
    const wrapper = mount(EventCard, { props: { card: { ...card, accessMode: 'open' } }, global })
    expect(wrapper.text()).not.toContain('Bewerbung')
    expect(wrapper.text()).not.toContain('Anmeldung')
  })
})

describe('EventSection', () => {
  it('shows the empty state when given one and no events', () => {
    const wrapper = mount(EventSection, {
      props: { id: 'current', title: 'Aktuell', events: [], emptyText: 'Gerade läuft kein Event.', emptyActionLabel: 'Discord', emptyActionHref: 'https://1lf.link/discord' },
      global,
    })
    expect(wrapper.get('h2').text()).toBe('Aktuell')
    expect(wrapper.text()).toContain('Gerade läuft kein Event.')
    expect(wrapper.get('a').attributes('href')).toBe('https://1lf.link/discord')
  })

  it('disappears without events and without an empty state', () => {
    const wrapper = mount(EventSection, { props: { id: 'past', title: 'Vergangen', events: [] }, global })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('lists one card per event', () => {
    const wrapper = mount(EventSection, { props: { id: 'current', title: 'Aktuell', events: [card, { ...card, slug: 'b', path: '/de/events/b' }] }, global })
    expect(wrapper.findAll('li')).toHaveLength(2)
  })
})

describe('EventJoinBlock', () => {
  it('shows the server address and Discord for open events', () => {
    const wrapper = mount(EventJoinBlock, {
      props: { event: event({ join: { server: true, discord: 'https://discord.gg/x' } } as Partial<EventDocument>), accessOpen: true, discordUrl: 'https://1lf.link/discord', serverAddress: 'play.onelitefeather.net' },
      global,
    })
    expect(wrapper.text()).toContain('play.onelitefeather.net')
    expect(wrapper.get('a[href="https://discord.gg/x"]').text()).toContain('Discord beitreten')
  })

  it('offers "Anmelden" for signup and "Bewerben" for application', () => {
    const signup = mount(EventJoinBlock, { props: { event: event({ access: { mode: 'signup', url: 'https://forms.example/s' } } as Partial<EventDocument>), accessOpen: true, discordUrl: 'https://1lf.link/discord' }, global })
    expect(signup.get('a[href="https://forms.example/s"]').text()).toContain('Anmelden')
    const apply = mount(EventJoinBlock, { props: { event: event({ access: { mode: 'application', url: 'https://forms.example/a' } } as Partial<EventDocument>), accessOpen: true, discordUrl: 'https://1lf.link/discord' }, global })
    expect(apply.get('a[href="https://forms.example/a"]').text()).toContain('Bewerben')
  })

  it('shows invite-only events without any action', () => {
    const wrapper = mount(EventJoinBlock, { props: { event: event({ access: { mode: 'invite' } } as Partial<EventDocument>), accessOpen: true, discordUrl: 'https://1lf.link/discord' }, global })
    expect(wrapper.find('a, button').exists()).toBe(false)
    expect(wrapper.text()).toContain('nur auf Einladung')
  })

  it('disables the action outside the window and names it', () => {
    const wrapper = mount(EventJoinBlock, {
      props: {
        event: event({ access: { mode: 'application', url: 'https://forms.example/a', opens: '2026-09-20T12:00:00+02:00', closes: '2026-09-28T23:59:00+02:00' } } as Partial<EventDocument>),
        accessOpen: false,
        discordUrl: 'https://1lf.link/discord',
      },
      global,
    })
    const action = wrapper.get('[aria-disabled="true"]')
    expect(action.text()).toContain('Bewerben')
    expect(action.attributes('href')).toBeUndefined()
    expect(action.attributes('tabindex')).toBe('-1')
    expect(wrapper.text()).toContain('Anmeldezeitraum:')
    expect(wrapper.findAll('time')).toHaveLength(2)
    expect(wrapper.text()).toContain('nicht geöffnet')
  })

  it('lists requirements and the note as written', () => {
    const wrapper = mount(EventJoinBlock, {
      props: { event: event({ access: { mode: 'open', requirements: ['Lite-Rang'], note: '20 Plätze, Auslosung' } } as Partial<EventDocument>), accessOpen: true, discordUrl: 'https://1lf.link/discord' },
      global,
    })
    expect(wrapper.findAll('li').map((node) => node.text())).toEqual(['Lite-Rang'])
    expect(wrapper.text()).toContain('20 Plätze, Auslosung')
  })
})

describe('EventPhaseChip', () => {
  it('shows the neutral preview label for an unlisted, hidden event', () => {
    const wrapper = mount(EventPhaseChip, { props: { phase: 'hidden' }, global })
    expect(wrapper.text()).toBe('Vorschau')
  })
})

describe('EventTestingBlock', () => {
  it('shows the feedback link for a hidden preview, same as announced', () => {
    const wrapper = mount(EventTestingBlock, {
      props: { phase: 'hidden', testing: { feedbackUrl: 'https://forms.example/feedback' } },
      global,
    })
    expect(wrapper.get('a[href="https://forms.example/feedback"]').text()).toContain('Feedback melden')
  })
})

describe('Type blocks', () => {
  it('names an open beta of a feature, as in the spec scenario', () => {
    const wrapper = mount(EventBetaDetails, {
      props: { subject: { kind: 'feature', name: 'Grundstücks-Tool' }, accessMode: 'open' },
      global,
    })
    expect(wrapper.text()).toContain('Open Beta')
    expect(wrapper.text()).toContain('Grundstücks-Tool')
    expect(wrapper.text()).toContain('Funktion')
  })

  it('calls a beta closed for any access mode but open', () => {
    const wrapper = mount(EventBetaDetails, { props: { subject: { kind: 'gamemode', name: 'Maze' }, accessMode: 'application' }, global })
    expect(wrapper.text()).toContain('Closed Beta')
    expect(wrapper.text()).toContain('Spielmodus')
  })

  it('shows theme and deadline and drops out without fields', () => {
    const wrapper = mount(EventBuildDetails, {
      props: { build: { theme: 'Herbstmarkt', submissionDeadline: '2026-10-10T20:00:00+02:00' } },
      global,
    })
    expect(wrapper.text()).toContain('Herbstmarkt')
    expect(wrapper.findAll('time')).toHaveLength(1)
    const empty = mount(EventBuildDetails, { props: { build: {} }, global })
    expect(empty.html()).toBe('<!--v-if-->')
  })
})
