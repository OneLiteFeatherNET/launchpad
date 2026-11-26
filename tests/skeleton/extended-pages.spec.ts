// @vitest-environment nuxt
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import AboutSkeleton from '../../layers/about/components/AboutSkeleton.vue'
import CommunityOverviewSkeleton from '../../layers/community/components/CommunityOverviewSkeleton.vue'
import CarouselSkeleton from '../../layers/home/components/CarouselSkeleton.vue'
import FaqSectionSkeleton from '../../layers/home/components/FaqSectionSkeleton.vue'
import ServerAddressesSkeleton from '../../layers/home/components/ServerAddressesSkeleton.vue'
import ServerConceptSkeleton from '../../layers/home/components/ServerConceptSkeleton.vue'
import { CAROUSEL_FRAME } from '../../layers/home/utils/carouselClasses'
import OpenCollectiveSkeleton from '../../layers/opencollective/components/OpenCollectiveSkeleton.vue'
import SponsoringSkeleton from '../../layers/sponsoring/components/SponsoringSkeleton.vue'
import TeamRosterSkeleton from '../../layers/team/components/TeamRosterSkeleton.vue'

const read = (file: string) => readFileSync(join(__dirname, '../..', file), 'utf8')

const SKELETONS: [string, Component][] = [
  ['TeamRosterSkeleton', TeamRosterSkeleton],
  ['CommunityOverviewSkeleton', CommunityOverviewSkeleton],
  ['AboutSkeleton', AboutSkeleton],
  ['CarouselSkeleton', CarouselSkeleton],
  ['ServerAddressesSkeleton', ServerAddressesSkeleton],
  ['ServerConceptSkeleton', ServerConceptSkeleton],
  ['SponsoringSkeleton', SponsoringSkeleton],
  ['OpenCollectiveSkeleton', OpenCollectiveSkeleton],
  ['FaqSectionSkeleton', FaqSectionSkeleton]
]

describe.each(SKELETONS)('%s', (_name, component) => {
  it('is a busy region with a loading text for screen readers', async () => {
    const wrapper = await mountSuspended(component)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').text()).not.toBe('')
  })
})

describe('TeamRosterSkeleton', () => {
  it('shows a grid of placeholder member cards in the width of the real cards', async () => {
    const wrapper = await mountSuspended(TeamRosterSkeleton)
    const cards = wrapper.findAll('li.w-72')
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })
})

describe('CarouselSkeleton', () => {
  it('takes the frame, the 16:9 ratio and the minimum height of the real carousel', async () => {
    const wrapper = await mountSuspended(CarouselSkeleton)
    const frame = wrapper.find('[data-carousel-skeleton-frame]')
    for (const name of CAROUSEL_FRAME.split(' ')) expect(frame.classes()).toContain(name)
    expect(frame.attributes('style')).toContain('padding-top: 56.25%')
  })

  it('shares its frame with the carousel, so the two cannot drift apart', () => {
    expect(read('layers/home/components/Carousel.vue')).toContain('CAROUSEL_FRAME')
  })
})

describe('AboutSkeleton', () => {
  it('stands in for the sections above the community strip and for those below it', async () => {
    const intro = await mountSuspended(AboutSkeleton, { props: { part: 'intro' } })
    const outro = await mountSuspended(AboutSkeleton, { props: { part: 'outro' } })
    expect(intro.html()).not.toBe(outro.html())
  })
})

/** Composables whose data a page waits for: they must load lazily and report it. */
describe.each([
  'layers/team/composables/useTeamRoster.ts',
  'layers/about/composables/useAbout.ts',
  'composables/useCommunityOverview.ts',
  'composables/useHomeHighlights.ts',
  'layers/events/composables/useEvents.ts',
  'layers/home/composables/useHomeContent.ts',
  'layers/home/composables/useFaqContent.ts',
  'layers/sponsoring/composables/useSponsoring.ts',
  'layers/opencollective/composables/useOpenCollective.ts'
])('%s', (file) => {
  const source = read(file)

  it('loads with the page data options, so a client navigation does not wait', () => {
    expect(source).toContain('...PAGE_DATA_OPTIONS')
  })

  it('tells the page whether it is still loading', () => {
    expect(source).toContain('useIsLoading(')
  })
})

describe('pages', () => {
  it('team overview shows the roster skeleton while the roster loads', () => {
    const page = read('pages/team/index.vue')
    expect(page).toMatch(/const \{[^}]*\bloading\b[^}]*\} = useTeamRoster\(/)
    expect(page).toContain('<TeamRosterSkeleton v-if="loading"')
  })

  it('community page shows its skeleton while the overview loads', () => {
    const page = read('pages/community.vue')
    expect(page).toMatch(/const \{[^}]*\bloading\b[^}]*\} = useCommunityOverview\(/)
    expect(page).toContain('<CommunityOverviewSkeleton v-if="loading"')
  })

  it('about page shows its skeleton while the document loads, above and below the strip', () => {
    const page = read('pages/about.vue')
    expect(page).toMatch(/const \{[^}]*\bloading\b[^}]*\} = await useAbout\(/)
    expect(page).toContain('<AboutSkeleton v-if="loading" part="intro"')
    expect(page).toContain('<AboutSkeleton v-if="loading" part="outro"')
  })

  describe('home', () => {
    const page = read('pages/index.vue')

    it('shows a placeholder for each section with its own query', () => {
      for (const skeleton of [
        'CarouselSkeleton',
        'ServerAddressesSkeleton',
        'ServerConceptSkeleton',
        'SponsoringSkeleton',
        'OpenCollectiveSkeleton',
        'FaqSectionSkeleton'
      ]) expect(page).toContain(`<${skeleton}`)
    })

    it('keeps a section hidden after loading when it has nothing to show', () => {
      expect(page).toMatch(/<LazyServerAddresses\s+v-else-if="connect"/)
      expect(page).toMatch(/<LazyServerConcept\s+v-else-if="concept"/)
      expect(page).toMatch(/<LazySponsoring v-else-if="sponsors\?\.length"/)
      expect(page).toMatch(/<LazyOpenCollectiveStats\s+v-else-if="collective\.available"/)
    })

    it('leaves the carousel, its preload and its priority image to the server render', () => {
      expect(page).toMatch(/<Carousel\s+v-else/)
      expect(page).toContain('aspect="16/9"')
    })
  })

  it('no page forces a skeleton with a literal, so the server HTML never carries one', () => {
    const files = [
      'pages/index.vue',
      'pages/team/index.vue',
      'pages/community.vue',
      'pages/about.vue'
    ]
    for (const file of files) expect(read(file)).not.toMatch(/Skeleton[^>]*v-if="true"/)
  })
})
