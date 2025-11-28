/**
 * Carousel Slide Data Models
 *
 * This file contains all slide types for the Carousel component system.
 */

/**
 * Basic image slide
 */
export interface ImageSlide {
  type: 'image'
  src: string
  alt: string
  note?: string
}

/**
 * Blog article slide
 */
export interface BlogSlide {
  type: 'blog'
  title: string
  href: string
  excerpt?: string
  image?: string
  alt?: string
  author?: string
  date?: string | Date
  tag?: string
}

/**
 * News slide
 */
export interface NewsSlide {
  type: 'news'
  title: string
  href?: string
  summary?: string
  image?: string
  alt?: string
  date?: string | Date
  tag?: string
}

/**
 * Event slide
 */
export interface EventSlide {
  type: 'event'
  title: string
  dateStart: string | Date
  dateEnd?: string | Date
  location?: string
  href?: string
  image?: string
  alt?: string
  note?: string
}

/**
 * Legacy format for backward compatibility
 * Will be automatically converted to ImageSlide
 */
export interface LegacyImageSlide {
  src: string
  alt: string
  note?: string
}

/**
 * Union type of all supported slide types
 */
export type AnySlide = ImageSlide | BlogSlide | NewsSlide | EventSlide | LegacyImageSlide

/**
 * Union type of normalized slides (without legacy)
 */
export type NormalizedSlide = ImageSlide | BlogSlide | NewsSlide | EventSlide

/**
 * Slide type discriminator for type guards
 */
export type SlideType = 'image' | 'blog' | 'news' | 'event'

