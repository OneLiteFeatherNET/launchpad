import type { AnySlide, ImageSlide, BlogSlide, NewsSlide, EventSlide, NormalizedSlide, LegacyImageSlide } from '~/types/carousel'

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
 * Extracts a label text from a slide for accessibility
 */
export function getSlideLabel(slide: NormalizedSlide): string {
  switch (slide.type) {
    case 'image':
      return slide.alt || 'Image'
    case 'blog':
      return slide.title
    case 'news':
      return slide.title
    case 'event':
      return slide.title
    default:
      return 'Slide'
  }
}

/**
 * Generates ARIA text for a slide including position
 */
export function getSlideAriaText(slide: NormalizedSlide, index: number, total: number): string {
  const label = getSlideLabel(slide)
  return `Slide ${index + 1} of ${total}: ${label}`
}

