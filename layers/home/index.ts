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
  getSlideLabel,
  getSlideAriaText
} from './composables/useCarousel'
export type { TranslateSlideText } from './composables/useCarousel'
export { useFaqContent } from './composables/useFaqContent'
export type * from './types'
