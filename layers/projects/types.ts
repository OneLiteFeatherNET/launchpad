// The CMS-derived document shape lives in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// Everything below derives from it by indexed access, as community-poi does.
import type { ProjectDocument, ProjectSummary } from '#layers/content-core/types'

export type { ProjectDocument, ProjectSummary }

export const PROJECT_STATUSES = [
  'active',
  'maintenance',
  'archived'
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** external: usable by anyone. internal: artefacts are not public, the source is. */
export const PROJECT_AUDIENCES = ['external', 'internal'] as const
export type ProjectAudience = (typeof PROJECT_AUDIENCES)[number]

export type ProjectLinks = NonNullable<ProjectDocument['links']>
export type ProjectDownload = NonNullable<ProjectLinks['downloads']>[number]
