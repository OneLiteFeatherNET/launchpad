import { useRuntimeConfig } from '#imports'
import type { CollectiveStats } from '../types'

type PublicCollectiveConfig = {
  openCollectiveSlug?: string
  openCollectiveGoal?: number | string
  openCollectiveCurrency?: string
}

export const useOpenCollective = () => {
  const config = useRuntimeConfig()
  const publicConfig = (config.public || {}) as PublicCollectiveConfig
  const slug = publicConfig.openCollectiveSlug || 'onelitefeather'
  const fallbackGoal = Number(publicConfig.openCollectiveGoal ?? 3000)
  const fallbackCurrency = publicConfig.openCollectiveCurrency || 'EUR'
  const link = `https://opencollective.com/${slug}`

  const buildFallback = (): CollectiveStats => ({
    slug,
    currency: fallbackCurrency,
    totalRaised: 0,
    goal: fallbackGoal,
    contributors: null,
    updatedAt: new Date().toISOString(),
    link
  })

  const { data, error, refresh, pending } = useAsyncData<CollectiveStats>(
    'opencollective-stats',
    async (): Promise<CollectiveStats> => {
      try {
        return await $fetch<CollectiveStats>('/api/opencollective', { timeout: 5000 })
      } catch (err) {
        console.warn('[useOpenCollective] failed to load stats', err)
        return buildFallback()
      }
    },
    {
      server: true,
      lazy: false,
      default: buildFallback
    }
  )

  return {
    data,
    error,
    refresh,
    pending
  }
}
