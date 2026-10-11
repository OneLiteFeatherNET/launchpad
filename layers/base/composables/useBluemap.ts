import type { BluemapDimension } from '../types'

// NUXT_PUBLIC_BLUEMAP_URL overrides the default in nuxt.config.ts.
export const useBluemapUrl = (): string => {
  return useRuntimeConfig().public.bluemapUrl as string
}

type MapIds = Partial<Record<BluemapDimension, string>>

export const useBluemapMapIds = (): MapIds => {
  return (useRuntimeConfig().public.bluemapMapIds || {}) as MapIds
}
