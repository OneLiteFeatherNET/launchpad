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
  /** Published on the site within the highlight window. */
  isNew?: boolean
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
  isNew?: boolean
}

/**
 * Community POI slide. `href` cross-links to the POI detail page.
 */
export interface PoiSlide {
  type: 'poi'
  title: string
  href: string
  caption?: string
  image?: string
  alt?: string
  status?: 'planning' | 'in-progress' | 'paused' | 'completed'
  progress?: number
  category?: 'team' | 'community' | 'collab'
  isNew?: boolean
}

/**
 * Project slide. `href` cross-links to the project detail page.
 */
export interface ProjectSlide {
  type: 'project'
  title: string
  href: string
  summary?: string
  image?: string
  alt?: string
  status?: 'active' | 'maintenance' | 'archived'
  platforms?: string[]
  isNew?: boolean
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
  isNew?: boolean
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
export type AnySlide =
  | ImageSlide
  | BlogSlide
  | NewsSlide
  | EventSlide
  | PoiSlide
  | ProjectSlide
  | LegacyImageSlide

/**
 * Union type of normalized slides (without legacy)
 */
export type NormalizedSlide =
  | ImageSlide
  | BlogSlide
  | NewsSlide
  | EventSlide
  | PoiSlide
  | ProjectSlide

/**
 * Slide type discriminator for type guards
 */
export type SlideType = 'image' | 'blog' | 'news' | 'event' | 'poi' | 'project'

