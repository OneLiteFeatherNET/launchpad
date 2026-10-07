import { describe, expect, it } from 'vitest'
import {
  HIGHLIGHT_WINDOW_DAYS,
  MAX_HIGHLIGHTS,
  composeSlides,
  eventSlide,
  freshBlogArticles,
  freshSlides,
  isNewAt
} from '../../layers/home/utils/highlights'
import { getSlideLabel } from '../../layers/home/composables/useCarousel'
import type { ImageSlide, PoiSlide } from '../../layers/home/types'

const NOW = new Date('2026-10-07T12:00:00Z')
const DAY = 86_400_000
const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString()

const article = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  title: `Article ${slug}`,
  description: `About ${slug}`,
  headerImage: `/images/blog/${slug}.webp`,
  headerImageAlt: `Cover ${slug}`,
  pubDate: daysAgo(40),
  author: 'themeinerlp',
  ...extra
})

const poi = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  title: `Build ${slug}`,
  summary: `Summary ${slug}`,
  featuredCaption: undefined,
  status: 'in-progress',
  progress: 40,
  category: 'community',
  thumbnail: `/images/poi/${slug}.webp`,
  thumbnailAlt: `Photo ${slug}`,
  galleryCount: 0,
  schematicCount: 0,
  ...extra
})

const project = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  title: `Project ${slug}`,
  summary: `Summary ${slug}`,
  status: 'active',
  platforms: ['Paper'],
  ...extra
})

const sources = (extra: Record<string, unknown> = {}) => ({
  locale: 'en',
  now: NOW,
  articles: [],
  people: [{ slug: 'themeinerlp', name: 'Phillipp', kind: 'team', profilePath: '/en/team/themeinerlp' }],
  pois: [],
  projects: [],
  ...extra
}) as unknown as Parameters<typeof freshSlides>[0]

const hrefs = (slides: { href?: string }[]) => slides.map((slide) => slide.href)

describe('isNewAt', () => {
  it('counts the whole window including its edge', () => {
    expect(HIGHLIGHT_WINDOW_DAYS).toBe(30)
    expect(isNewAt(daysAgo(0), NOW)).toBe(true)
    expect(isNewAt(daysAgo(30), NOW)).toBe(true)
    expect(isNewAt(daysAgo(30.01), NOW)).toBe(false)
  })

  it('does not count the future, a missing date or an unreadable one', () => {
    expect(isNewAt(daysAgo(-1), NOW)).toBe(false)
    expect(isNewAt(undefined, NOW)).toBe(false)
    expect(isNewAt('soon', NOW)).toBe(false)
  })

  it('reads a date-only value as that day', () => {
    expect(isNewAt('2026-10-07', NOW)).toBe(true)
    expect(isNewAt(new Date('2026-09-01'), NOW)).toBe(false)
  })
})

describe('freshSlides', () => {
  it('turns a new project into a slide from its own fields, marked new', () => {
    const [slide] = freshSlides(sources({
      projects: [project('arcr', { publishedAt: '2026-10-07', logo: '/images/arcr.webp', logoAlt: 'ARCR logo' })]
    }))
    expect(slide).toEqual({
      type: 'project',
      title: 'Project arcr',
      href: '/en/projects/arcr',
      summary: 'Summary arcr',
      image: '/images/arcr.webp',
      alt: 'ARCR logo',
      status: 'active',
      platforms: ['Paper'],
      isNew: true
    })
  })

  it('takes a blog slide from the article and names the author, not the slug', () => {
    const [slide] = freshSlides(sources({ articles: [article('release', { releaseDate: daysAgo(2) })] }))
    expect(slide).toMatchObject({
      type: 'blog',
      title: 'Article release',
      href: '/en/blog/release',
      excerpt: 'About release',
      image: '/images/blog/release.webp',
      alt: 'Cover release',
      author: 'Phillipp',
      date: daysAgo(2),
      isNew: true
    })
  })

  it('dates an article by releaseDate before pubDate', () => {
    const fresh = freshSlides(sources({
      articles: [article('scheduled', { pubDate: daysAgo(90), releaseDate: daysAgo(1) })]
    }))
    expect(hrefs(fresh as never)).toEqual(['/en/blog/scheduled'])
  })

  it('holds back an article whose release date has not come', () => {
    expect(freshSlides(sources({ articles: [article('later', { releaseDate: daysAgo(-3) })] }))).toEqual([])
  })

  it('turns a new poi into a poi slide', () => {
    const [slide] = freshSlides(sources({ pois: [poi('maze', { publishedAt: daysAgo(5) })] })) as PoiSlide[]
    expect(slide).toMatchObject({
      type: 'poi',
      href: '/en/community-poi/maze',
      caption: 'Summary maze',
      image: '/images/poi/maze.webp',
      isNew: true
    })
  })

  it('ignores content without a publication date, however recently it was started or released', () => {
    const slides = freshSlides(sources({
      pois: [poi('started', { startedAt: daysAgo(1), updatedAt: daysAgo(1) })],
      projects: [project('released', { releasedAt: daysAgo(1) })]
    }))
    expect(slides).toEqual([])
  })

  it('puts the newest first and breaks ties by href', () => {
    const slides = freshSlides(sources({
      articles: [article('b', { pubDate: daysAgo(10) }), article('a', { pubDate: daysAgo(10) })],
      pois: [poi('mid', { publishedAt: daysAgo(6) })],
      projects: [project('fresh', { publishedAt: daysAgo(1) })]
    }))
    expect(hrefs(slides as never)).toEqual([
      '/en/projects/fresh',
      '/en/community-poi/mid',
      '/en/blog/a',
      '/en/blog/b'
    ])
  })

  it('keeps the newest six of more', () => {
    const projects = Array.from({ length: 8 }, (_, index) => project(`p${index}`, { publishedAt: daysAgo(index + 1) }))
    const slides = freshSlides(sources({ projects }))
    expect(MAX_HIGHLIGHTS).toBe(6)
    expect(hrefs(slides as never)).toEqual(['p0',
'p1',
'p2',
'p3',
'p4',
'p5'].map((slug) => `/en/projects/${slug}`))
  })

  it('is the same for the same data and the same moment', () => {
    const input = sources({ projects: [project('x', { publishedAt: daysAgo(2) })] })
    expect(freshSlides(input)).toEqual(freshSlides(input))
  })

  it('carries neither path nor stem', () => {
    const slides = freshSlides(sources({
      projects: [project('x', { publishedAt: daysAgo(2), path: '/projects/en/x', stem: 'projects/en/x' })]
    }))
    expect(JSON.stringify(slides)).not.toMatch(/"(path|stem)"/)
  })
})

describe('freshBlogArticles', () => {
  it('keeps released articles inside the window only', () => {
    const kept = freshBlogArticles([
      article('fresh', { pubDate: daysAgo(3) }),
      article('old', { pubDate: daysAgo(60) }),
      article('later', { releaseDate: daysAgo(-1) })
    ] as never, NOW)
    expect(kept.map((entry) => entry.slug)).toEqual(['fresh'])
  })
})

describe('eventSlide', () => {
  const card = {
    title: 'Build contest',
    summary: 'Build something',
    startsAt: '2026-10-20T18:00:00+02:00',
    endsAt: '2026-10-21T18:00:00+02:00',
    path: '/en/events/build-contest',
    thumbnail: '/images/events/contest.webp',
    thumbnailAlt: 'Contest'
  }

  it('maps the card as before and marks it new when announced inside the window', () => {
    expect(eventSlide({ ...card, announcedAt: daysAgo(4) }, NOW)).toEqual({
      type: 'event',
      title: 'Build contest',
      dateStart: card.startsAt,
      dateEnd: card.endsAt,
      href: card.path,
      image: card.thumbnail,
      alt: card.thumbnailAlt,
      note: 'Build something',
      isNew: true
    })
  })

  it('does not mark an event announced long ago or never', () => {
    expect(eventSlide({ ...card, announcedAt: daysAgo(45) }, NOW)).not.toHaveProperty('isNew')
    expect(eventSlide(card, NOW)).not.toHaveProperty('isNew')
  })
})

describe('composeSlides', () => {
  const image = (src: string): ImageSlide => ({ type: 'image', src, alt: src })
  const curatedPoi: PoiSlide = { type: 'poi', title: 'Featured', href: '/en/community-poi/maze' }

  it('leads with events, then the new slides, then the curated ones', () => {
    const event = eventSlide({ title: 'E', startsAt: '2026-10-20T18:00:00Z', path: '/en/events/e' }, NOW)
    const fresh = freshSlides(sources({ projects: [project('arcr', { publishedAt: daysAgo(1) })] }))
    const slides = composeSlides({ events: [event], fresh, curated: [image('/a.png')] })
    expect(slides.map((slide) => (slide as { type: string }).type)).toEqual(['event',
'project',
'image'])
  })

  it('shows exactly the curated slides when nothing is new', () => {
    const curated = [image('/a.png'), image('/b.png')]
    expect(composeSlides({ events: [], fresh: [], curated })).toEqual(curated)
  })

  it('drops a curated slide that points where a new one already does', () => {
    const fresh = freshSlides(sources({ pois: [poi('maze', { publishedAt: daysAgo(2) })] }))
    const slides = composeSlides({ events: [], fresh, curated: [curatedPoi, image('/a.png')] })
    expect(slides.map((slide) => (slide as { type: string }).type)).toEqual(['poi', 'image'])
    expect((slides[0] as PoiSlide).isNew).toBe(true)
  })
})

describe('slide label', () => {
  const t = (key: string, named: Record<string, unknown>) => key === 'carousel.new_label' ? `New: ${String(named.title)}` : key

  it('puts the new marker in front of a new slide label', () => {
    const [slide] = freshSlides(sources({ projects: [project('arcr', { publishedAt: daysAgo(1) })] }))
    expect(getSlideLabel(slide!, t)).toBe('New: Project arcr')
  })

  it('leaves the label of an ordinary slide alone', () => {
    expect(getSlideLabel({ type: 'poi', title: 'Maze', href: '/x' }, t)).toBe('Maze')
  })
})
