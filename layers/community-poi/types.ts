// The CMS-derived document shape lives in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// This re-exports it under the same name and derives the plain shapes this
// layer's composable and components actually work with, via indexed access
// against the document type rather than duplicating named sub-interfaces.
import type { CommunityPoiDocument } from '#layers/content-core'
import { COMMUNITY_POI_STATUS_ORDER } from '#layers/content-core'

export type { CommunityPoiDocument }
// Re-exported under its existing name rather than defined here: `home`'s
// carousel needs the identical ordering for the same schema enum, so it
// lives in content-core beside `CommunityPoiDocument.status` — see the
// comment there.
export { COMMUNITY_POI_STATUS_ORDER }

/** A single community POI, as the composable and components consume it. */
export type CommunityPoi = CommunityPoiDocument

export const COMMUNITY_POI_STATUSES = [
  'planning',
  'in-progress',
  'paused',
  'completed'
] as const
export type CommunityPoiStatus = (typeof COMMUNITY_POI_STATUSES)[number]

export const COMMUNITY_POI_CATEGORIES = ['team',
'community',
'collab',
'farm'] as const
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

export type CommunityPoiBuilder = NonNullable<CommunityPoiDocument['builders']>[number]
export type CommunityPoiImage = NonNullable<CommunityPoiDocument['gallery']>[number]
export type CommunityPoiSchematic = NonNullable<CommunityPoiDocument['schematics']>[number]
export type CommunityPoiSchematicOrigin = NonNullable<CommunityPoiSchematic['origin']>
export type CommunityPoiCoordinates = NonNullable<CommunityPoiDocument['coordinates']>
export type CommunityPoiAlternateHeader = NonNullable<CommunityPoiDocument['alternates']>[number]
