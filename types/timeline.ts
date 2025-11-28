export type TimelineSide = 'left' | 'right'

export type TimelineColorVariant = 'brand' | 'accent' | 'neutral' | 'orange' | 'purple'

export interface TimelineEvent {
  id: string | number
  title: string
  date: string | Date
  description?: string
  href?: string
  icon?: string
  side?: TimelineSide
  colorVariant?: TimelineColorVariant
  // Beliebige zusätzliche Felder zulassen
  [key: string]: unknown
}
