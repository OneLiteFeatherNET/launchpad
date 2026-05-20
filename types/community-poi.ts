import type {
  CommunityPoiDeCollectionItem,
  CommunityPoiEnCollectionItem
} from '@nuxt/content'

export const COMMUNITY_POI_STATUSES = [
  'planning',
  'in-progress',
  'paused',
  'completed'
] as const
export type CommunityPoiStatus = (typeof COMMUNITY_POI_STATUSES)[number]

export const COMMUNITY_POI_CATEGORIES = ['team',
'community',
'collab'] as const
export type CommunityPoiCategory = (typeof COMMUNITY_POI_CATEGORIES)[number]

export const COMMUNITY_POI_FACINGS = ['north',
'south',
'east',
'west'] as const
export type CommunityPoiFacing = (typeof COMMUNITY_POI_FACINGS)[number]

// Litematica placement rotation values (UI labels CW_90, CW_180, CCW_90…).
// We store the lower-case form so it doubles as an i18n key.
export const COMMUNITY_POI_ROTATIONS = [
  'none',
  'cw_90',
  'cw_180',
  'cw_270',
  'ccw_90'
] as const
export type CommunityPoiRotation = (typeof COMMUNITY_POI_ROTATIONS)[number]

// Status order used for sorting on the overview page (in-progress first
// because that's where the community can still help; completed last).
export const COMMUNITY_POI_STATUS_ORDER: Record<CommunityPoiStatus, number> = {
  'in-progress': 0,
  planning: 1,
  paused: 2,
  completed: 3
}

export interface CommunityPoiBuilder {
  name: string
  mcName?: string
  link?: string
}

export interface CommunityPoiImage {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export interface CommunityPoiSchematicOrigin {
  x: number
  y: number
  z: number
}

export interface CommunityPoiSchematic {
  url: string
  name: string
  format?: 'litematic' | 'schem' | 'schematic' | 'nbt'
  version?: string
  litematicaVersion?: string
  sizeLabel?: string
  origin?: CommunityPoiSchematicOrigin
  facing?: CommunityPoiFacing
  rotation?: CommunityPoiRotation
  setupNotes?: string
}

export interface CommunityPoiCoordinates {
  x: number
  y?: number
  z: number
  dimension?: 'overworld' | 'nether' | 'end'
}

export interface CommunityPoiAlternateHeader {
  hreflang: string
  href: string
}

export type CommunityPoi = (
  | CommunityPoiDeCollectionItem
  | CommunityPoiEnCollectionItem
) & {
  slug: string
  translationKey?: string
  title: string
  summary: string
  status: CommunityPoiStatus
  progress: number
  category?: CommunityPoiCategory
  featured?: boolean
  featuredCaption?: string
  lore?: string
  goal?: string
  currentState?: string
  builders?: CommunityPoiBuilder[]
  location?: string
  coordinates?: CommunityPoiCoordinates
  thumbnail?: string
  thumbnailAlt?: string
  gallery?: CommunityPoiImage[]
  schematics?: CommunityPoiSchematic[]
  startedAt?: string | Date
  updatedAt?: string | Date
  forumUrl?: string
  acceptsContributions?: boolean
  canonical?: string
  alternates?: CommunityPoiAlternateHeader[]
  head?: Record<string, unknown>
}
