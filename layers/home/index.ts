// Public API of the home layer.
export { useHomeContent } from './composables/useHomeContent'
export { useHomeSeo } from './composables/useHomeSeo'
export {
  normalizeSlide,
  normalizeSlides,
  isImageSlide,
  isBlogSlide,
  isNewsSlide,
  isEventSlide,
  isPoiSlide,
  isProjectSlide,
  getSlideLabel,
  getSlideAriaText
} from './composables/useCarousel'
export {
  HIGHLIGHT_WINDOW_DAYS,
  MAX_HIGHLIGHTS,
  isNewAt,
  freshBlogArticles,
  freshSlides,
  eventSlide,
  composeSlides
} from './utils/highlights'
export type { HighlightSources, HighlightEvent } from './utils/highlights'
export type { TranslateSlideText } from './composables/useCarousel'
export { useFaqContent } from './composables/useFaqContent'
export type * from './types'
