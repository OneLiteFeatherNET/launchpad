// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import CommunityPoiCard from '../../components/features/community-poi/CommunityPoiCard.vue'
import type { CommunityPoi } from '../../types/community-poi'

/**
 * The static check in `poi-card-image-fallback.spec.ts` says the wiring is
 * there. This one says it does something: emit `error` from the picture and
 * the placeholder has to take its place.
 *
 * Server rendering cannot show this — a load failure is a client event, and
 * the markup it produces looks identical either way until the browser tries
 * to fetch. So the swap gets mounted and driven rather than read.
 */

const poi = {
  slug: 'labyrinth',
  title: 'Labyrinth von B3nNy',
  thumbnail: '/community-poi/labyrinth/cover.webp',
  thumbnailAlt: 'Render des Labyrinths',
  status: 'in_progress',
  progress: 40
} as unknown as CommunityPoi

const stubs = {
  NuxtPicture: { name: 'NuxtPicture', template: '<picture data-test="thumb" />' },
  NuxtLink: { name: 'NuxtLink', template: '<a><slot /></a>' },
  IconFa: { name: 'IconFa', template: '<i data-test="placeholder" />' },
  CommunityPoiStatusBadge: true,
  CommunityPoiCategoryBadge: true,
  CommunityPoiProgressBar: true
}

// The card calls `useI18n()`, which needs a real instance rather than a mock.
// `legacy: false` as a literal via the generic — inferring it from the option
// alone leaves createI18n's overloads ambiguous (TS2769).
const i18n = createI18n<false>({ legacy: false, locale: 'de', messages: { de: {}, en: {} } })

const mountCard = () => mount(CommunityPoiCard, {
  props: { poi },
  global: { stubs, plugins: [i18n] }
})

describe('POI card, driven', () => {
  it('replaces a failed thumbnail with the placeholder', async () => {
    const wrapper = mountCard()

    expect(wrapper.find('[data-test="thumb"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(false)

    await wrapper.findComponent({ name: 'NuxtPicture' }).vm.$emit('error')

    // The picture is gone and the placeholder stands in its place — the same
    // one a POI with no thumbnail at all gets.
    expect(wrapper.find('[data-test="thumb"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(true)
  })

  it('recovers when the slot shows a different POI', async () => {
    const wrapper = mountCard()
    await wrapper.findComponent({ name: 'NuxtPicture' }).vm.$emit('error')
    expect(wrapper.find('[data-test="thumb"]').exists()).toBe(false)

    // List renders reuse cards. Without the reset, this POI's picture would
    // stay hidden because a previous one failed.
    const other = { ...poi, slug: 'yggdrasil', thumbnail: '/images/x.webp' }
    await wrapper.setProps({ poi: other })

    expect(wrapper.find('[data-test="thumb"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="placeholder"]').exists()).toBe(false)
  })
})
