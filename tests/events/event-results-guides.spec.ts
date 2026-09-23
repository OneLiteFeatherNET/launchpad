// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import M3Button from '../../layers/base/components/M3Button.vue'
import M3Tabs from '../../layers/base/components/M3Tabs.vue'
import EventGuide from '../../layers/events/components/EventGuide.vue'
import EventGuides from '../../layers/events/components/EventGuides.vue'
import EventResults from '../../layers/events/components/EventResults.vue'
import EventTestingBlock from '../../layers/events/components/EventTestingBlock.vue'

/**
 * Guides, the beta test block and results — spec `events`, requirements
 * "Anleitungen erklären ein Event je Rolle", "Betas zeigen, was getestet wird"
 * and "Beendete Events zeigen ihr Ergebnis".
 */

const i18n = () => createI18n<false>({ legacy: false, locale: 'de', messages: { de, en } })
const global = {
  plugins: [i18n()],
  stubs: { NuxtPicture: true, IconFa: true },
  components: { M3Button, M3Tabs, EventGuide },
}

describe('EventResults', () => {
  it('shows verdict, placements in order, figures and next steps', () => {
    const wrapper = mount(EventResults, {
      props: {
        results: {
          summary: '14 Teams, ein Strand.',
          placements: [{ place: 3, name: 'Leuchtturm' },
{ place: 1, name: 'Sandburg' },
{ place: 2, name: 'Welle' }],
          stats: [{ label: 'Teilnehmer', value: '42' }],
          outcome: ['Der Siegerbau kommt an den Spawn.'],
        },
      },
      global,
    })
    expect(wrapper.text()).toContain('14 Teams, ein Strand.')
    expect(wrapper.findAll('ol li').map((node) => node.text())).toEqual([
      expect.stringContaining('Platz 1'),
      expect.stringContaining('Platz 2'),
      expect.stringContaining('Platz 3'),
    ])
    expect(wrapper.get('dl').text()).toContain('Teilnehmer')
    expect(wrapper.get('dl').text()).toContain('42')
    expect(wrapper.text()).toContain('Wie geht es weiter')
  })

  it('says results will follow when there are none', () => {
    expect(mount(EventResults, { props: {}, global }).text()).toContain('Die Ergebnisse folgen')
    const empty = mount(EventResults, { props: { results: {} }, global })
    expect(empty.text()).toContain('Die Ergebnisse folgen')
  })
})

describe('EventTestingBlock', () => {
  const testing = {
    focus: ['Balance', 'Performance'],
    knownIssues: ['Taschenlampe flackert'],
    feedbackUrl: 'https://1lf.link/discord',
  }

  it('lists focus and known issues and offers feedback while the test runs', () => {
    const wrapper = mount(EventTestingBlock, { props: { testing, phase: 'running' }, global })
    expect(wrapper.text()).toContain('Balance')
    expect(wrapper.text()).toContain('Taschenlampe flackert')
    expect(wrapper.get('a[href="https://1lf.link/discord"]').text()).toContain('Feedback melden')
  })

  it('keeps the record but drops the feedback action once the test is over', () => {
    const wrapper = mount(EventTestingBlock, { props: { testing, phase: 'past' }, global })
    expect(wrapper.text()).toContain('Taschenlampe flackert')
    expect(wrapper.find('a').exists()).toBe(false)
  })
})

const survivor = () => h(EventGuide, { role: 'Survivor', icon: 'person-running' }, () => h('p', 'Sammle 8 Seiten.'))
const slender = () => h(EventGuide, { role: 'Slender', icon: 'ghost' }, () => h('p', 'Fang alle Survivor.'))
const twoRoles = () => [survivor(), slender()]

describe('EventGuides', () => {
  it('renders every guide with a heading on the server, readable without JS', async () => {
    const app = createSSRApp(defineComponent({ render: () => h(EventGuides, null, twoRoles) }))
    app.use(i18n())
    app.component('M3Tabs', M3Tabs)
    app.component('IconFa', defineComponent({ render: () => null }))
    const html = await renderToString(app)
    expect(html).not.toContain('role="tablist"')
    // No panel attribute `hidden` (class names like `overflow-hidden` are fine).
    expect(html).not.toMatch(/\shidden(?:[\s=>])/)
    expect(html).toContain('Sammle 8 Seiten.')
    expect(html).toContain('Fang alle Survivor.')
    expect(html.match(/<h3/g)).toHaveLength(2)
  })

  it('turns two roles into tabs after mounting, switchable with the arrow keys', async () => {
    const wrapper = mount(EventGuides, {
      slots: { default: twoRoles },
      global,
      attachTo: document.body,
    })
    await nextTick()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual(['Survivor', 'Slender'])
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0]!.attributes('hidden')).toBeUndefined()
    expect(panels[1]!.attributes('hidden')).toBeDefined()
    // The tab names the panel now; the guide's own heading would repeat it.
    expect(wrapper.findAll('h3')).toHaveLength(0)

    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    expect(document.activeElement?.textContent?.trim()).toBe('Slender')
    expect(wrapper.findAll('[role="tabpanel"]')[1]!.attributes('hidden')).toBeUndefined()
    expect(wrapper.findAll('[role="tabpanel"]')[1]!.attributes('aria-labelledby'))
      .toBe(wrapper.findAll('[role="tab"]')[1]!.attributes('id'))
    wrapper.unmount()
  })

  it('shows a single guide without tabs', async () => {
    const wrapper = mount(EventGuides, {
      slots: { default: () => [h(EventGuide, { role: 'Bauen' }, () => h('p', 'Los geht es.'))] },
      global,
    })
    await nextTick()
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.get('h3').text()).toBe('Bauen')
  })
})
