import type {
  AnySlide,
  ImageSlide,
  BlogSlide,
  NewsSlide,
  EventSlide,
  PoiSlide,
  NormalizedSlide,
  LegacyImageSlide
} from '~/types/carousel'

/**
 * Normalizes a slide to a typed format
 * Converts legacy slides to ImageSlides
 */
export function normalizeSlide(slide: AnySlide): NormalizedSlide {
  const any = slide as AnySlide

  // Return already typed slides directly
  if ((any as ImageSlide).type === 'image') {
    return any as ImageSlide
  }
  if ((any as BlogSlide).type === 'blog') {
    return any as BlogSlide
  }
  if ((any as NewsSlide).type === 'news') {
    return any as NewsSlide
  }
  if ((any as EventSlide).type === 'event') {
    return any as EventSlide
  }
  if ((any as PoiSlide).type === 'poi') {
    return any as PoiSlide
  }

  // Legacy format: has src/alt but no type
  if ((any as LegacyImageSlide).src && (any as LegacyImageSlide).alt) {
    const legacy = any as LegacyImageSlide
    return {
      type: 'image',
      src: legacy.src,
      alt: legacy.alt,
      note: legacy.note
    } as ImageSlide
  }

  // Fallback: empty image slide
  return {
    type: 'image',
    src: '',
    alt: ''
  } as ImageSlide
}

/**
 * Normalizes an array of slides
 */
export function normalizeSlides(slides: AnySlide[]): NormalizedSlide[] {
  return (slides || []).map(normalizeSlide)
}

/**
 * Type Guard: Checks if a slide is an ImageSlide
 */
export function isImageSlide(slide: NormalizedSlide): slide is ImageSlide {
  return slide.type === 'image'
}

/**
 * Type Guard: Checks if a slide is a BlogSlide
 */
export function isBlogSlide(slide: NormalizedSlide): slide is BlogSlide {
  return slide.type === 'blog'
}

/**
 * Type Guard: Checks if a slide is a NewsSlide
 */
export function isNewsSlide(slide: NormalizedSlide): slide is NewsSlide {
  return slide.type === 'news'
}

/**
 * Type Guard: Checks if a slide is an EventSlide
 */
export function isEventSlide(slide: NormalizedSlide): slide is EventSlide {
  return slide.type === 'event'
}

/**
 * Type Guard: Checks if a slide is a PoiSlide
 */
export function isPoiSlide(slide: NormalizedSlide): slide is PoiSlide {
  return slide.type === 'poi'
}

/**
 * The subset of vue-i18n's `t` these helpers need.
 *
 * Passed in rather than reached for: `useI18n()` is only valid inside setup,
 * and these are pure functions called from a template. Taking the translator
 * as an argument keeps them testable without a Nuxt runtime and keeps the
 * wording in the locale files where both languages can see it.
 */
export type TranslateSlideText = (key: string, named: Record<string, unknown>) => string

/**
 * Extracts a label text from a slide for accessibility
 */
export function getSlideLabel(slide: NormalizedSlide, t: TranslateSlideText): string {
  switch (slide.type) {
    case 'image':
      return slide.alt || t('carousel.image_fallback', {})
    case 'blog':
      return slide.title
    case 'news':
      return slide.title
    case 'event':
      return slide.title
    case 'poi':
      return slide.title
    default:
      return t('carousel.slide_fallback', {})
  }
}

/**
 * Generates ARIA text for a slide including position.
 *
 * The carousel's live region reads this out on every rotation, so the position
 * wording is the most-heard string in the component — and was hardcoded
 * English regardless of locale.
 */
export function getSlideAriaText(
  slide: NormalizedSlide,
  index: number,
  total: number,
  t: TranslateSlideText
): string {
  return t('carousel.slide_position', {
    index: index + 1,
    total,
    label: getSlideLabel(slide, t)
  })
}
