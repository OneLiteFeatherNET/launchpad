import type { AboutDocument } from '#layers/content-core/types'

export type { AboutDocument }

export type AboutPillar = NonNullable<AboutDocument['pillars']>[number]
