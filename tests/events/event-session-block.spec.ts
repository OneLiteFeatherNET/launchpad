// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import DateRange from '../../layers/base/components/DateRange.vue'
import M3Chip from '../../layers/base/components/M3Chip.vue'
import { CLIENT_CLOCK_KEY } from '../../layers/base/utils/clientClock'
import EventNextSession from '../../layers/events/components/EventNextSession.vue'
import type { EventSessions } from '../../layers/events/types'
import { manualClock } from '../helpers/manualClock'

const sessions = {
  label: 'Slender-Nacht',
  first: '2026-10-31T21:00:00+01:00',
  durationMinutes: 180,
  repeat: 'weekly',
} as EventSessions
const UNTIL = '2026-12-31T23:59:00+01:00'
const FIRST_NIGHT = { startsAt: '2026-10-31T20:00:00.000Z', endsAt: '2026-10-31T23:00:00.000Z' }

const i18n = (locale: 'de' | 'en' = 'de') => createI18n<false>({ legacy: false, locale, messages: { de, en } })
const at = (value: string) => manualClock(Date.parse(value))

function props(initial = FIRST_NIGHT) {
  return { sessions, until: UNTIL, initial }
}

function mountAt(clock: ReturnType<typeof at>, initial = FIRST_NIGHT, locale: 'de' | 'en' = 'de') {
  return mount(EventNextSession, {
    props: props(initial),
    global: {
      plugins: [i18n(locale)],
      provide: { [CLIENT_CLOCK_KEY as symbol]: clock },
      components: { DateRange, M3Chip },
    },
  })
}

function ssrApp(clock: ReturnType<typeof at>, initial = FIRST_NIGHT) {
  const app = createSSRApp(EventNextSession, props(initial))
  app.use(i18n())
  app.provide(CLIENT_CLOCK_KEY, clock)
  app.component('DateRange', DateRange)
  app.component('M3Chip', M3Chip)
  return app
}

describe('EventNextSession before mount', () => {
  it('renders the label and the absolute start in the server HTML', async () => {
    const html = await renderToString(ssrApp(at('2026-10-25T12:00:00+01:00')))
    expect(html).toContain('Slender-Nacht')
    expect(html).toContain('<time datetime="2026-10-31T20:00:00.000Z">')
  })

  it('names the weekly repetition in the server HTML', async () => {
    const html = await renderToString(ssrApp(at('2026-10-25T12:00:00+01:00')))
    expect(html).toContain('Jede Woche zur selben Zeit')
  })

  it('renders no countdown and no live label in the server HTML', async () => {
    const html = await renderToString(ssrApp(at('2026-10-31T21:30:00+01:00')))
    expect(html).not.toContain('role="timer"')
    expect(html).not.toContain('Läuft gerade')
  })
})

describe('EventNextSession after mount', () => {
  it('counts down to the start', async () => {
    const wrapper = mountAt(at('2026-10-30T18:30:00+01:00'))
    await nextTick()
    expect(wrapper.get('[role="timer"]').text()).toBe('beginnt in 1 Tag, 2 Stunden')
  })

  it('counts down in English', async () => {
    const wrapper = mountAt(at('2026-10-30T18:30:00+01:00'), FIRST_NIGHT, 'en')
    await nextTick()
    expect(wrapper.get('[role="timer"]').text()).toBe('starts in 1 day, 2 hours')
  })

  it('counts hours and minutes on the last day', async () => {
    const wrapper = mountAt(at('2026-10-31T18:30:00+01:00'))
    await nextTick()
    expect(wrapper.get('[role="timer"]').text()).toBe('beginnt in 2 Stunden, 30 Minuten')
  })

  it('counts only minutes in the last hour', async () => {
    const wrapper = mountAt(at('2026-10-31T20:15:00+01:00'))
    await nextTick()
    expect(wrapper.get('[role="timer"]').text()).toBe('beginnt in 45 Minuten')
  })

  it('says the session is happening while it runs', async () => {
    const wrapper = mountAt(at('2026-10-31T21:30:00+01:00'))
    await nextTick()
    expect(wrapper.text()).toContain('Läuft gerade')
    expect(wrapper.find('[role="timer"]').exists()).toBe(false)
  })

  it('moves a stale initial session to the following week', async () => {
    const wrapper = mountAt(at('2026-11-01T00:10:00+01:00'))
    await nextTick()
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-11-07T20:00:00.000Z')
    expect(wrapper.get('[role="timer"]').text()).toContain('beginnt in 6 Tagen')
  })

  it('switches from the countdown to "happening now" when the start passes', async () => {
    const clock = at('2026-10-31T20:59:30+01:00')
    const wrapper = mountAt(clock)
    await nextTick()
    expect(wrapper.get('[role="timer"]').text()).toBe('beginnt in 1 Minute')
    clock.advance(30_000)
    await nextTick()
    expect(wrapper.text()).toContain('Läuft gerade')
  })

  it('disappears when no session is left', async () => {
    const wrapper = mountAt(at('2026-12-27T12:00:00+01:00'))
    await nextTick()
    expect(wrapper.find('section').exists()).toBe(false)
  })
})

describe('EventNextSession hydration', () => {
  it('hydrates the server HTML without a mismatch and then adds the countdown', async () => {
    const serverHtml = await renderToString(ssrApp(at('2026-10-25T12:00:00+01:00')))
    const container = document.createElement('div')
    container.innerHTML = serverHtml

    const warnings: string[] = []
    const app = ssrApp(at('2026-10-30T18:30:00+01:00'))
    app.config.warnHandler = (message) => { warnings.push(message) }
    app.mount(container)
    await nextTick()

    expect(warnings.filter((message) => message.includes('ydration')), 'hydration warnings').toEqual([])
    expect(container.querySelector('[role="timer"]')?.textContent).toBe('beginnt in 1 Tag, 2 Stunden')
  })
})
