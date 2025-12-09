import { useRuntimeConfig } from '#imports'
import type { CollectiveResponse, CollectiveStats } from '~/types/opencollective'

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
        const url = `${link}.json`
        const res = await $fetch<CollectiveResponse>(url, { timeout: 5000 })

        const raisedCents = typeof res.balance === 'number' ? res.balance : 0
        const raised = Math.max(0, Math.round(raisedCents / 100))

        // Use goal from API if present (yearlyIncome), otherwise fallback
        const apiGoal =
          typeof res.yearlyIncome === 'number' ? Math.round(res.yearlyIncome / 100) : null

        return {
          slug,
          currency: res.currency || fallbackCurrency,
          totalRaised: raised,
          goal: apiGoal || fallbackGoal,
          contributors: res.backersCount ?? null,
          updatedAt: res.updatedAt || res.lastTransactionAt || new Date().toISOString(),
          link
        }
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
