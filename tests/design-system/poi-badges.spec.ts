// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import M3Chip from '../../layers/base/components/M3Chip.vue'
import CommunityPoiCategoryBadge from '../../layers/community-poi/components/CommunityPoiCategoryBadge.vue'
import CommunityPoiStatusBadge from '../../layers/community-poi/components/CommunityPoiStatusBadge.vue'

/**
 * POI status and category are labels, not controls: a plain span nobody can
 * tab to, tinted with a role container so the text keeps its contrast over
 * the card thumbnail they sit on. The container/on-container pairs
 * themselves are checked in contrast.spec.ts.
 */

const i18n = createI18n<false>({ legacy: false, locale: 'de', messages: { de: {}, en: {} } })
const global = { plugins: [i18n], components: { M3Chip }, stubs: { IconFa: true } }

describe('POI badges', () => {
  it.each([
    ['in-progress', 'bg-brand-orange-container'],
    ['planning', 'bg-secondary-container'],
    ['paused', 'bg-surface-container-highest'],
    ['completed', 'bg-primary-container'],
  ] as const)('status %s is a %s label, not a control', (status, container) => {
    const wrapper = mount(CommunityPoiStatusBadge, { props: { status }, global })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.classes()).toContain(container)
  })

  it.each([
    ['team', 'bg-brand-purple-container'],
    ['collab', 'bg-tertiary-container'],
    ['farm', 'bg-primary-container'],
    ['community', 'bg-secondary-container'],
  ] as const)('category %s is a %s label', (category, container) => {
    const wrapper = mount(CommunityPoiCategoryBadge, { props: { category }, global })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain(container)
  })
})
