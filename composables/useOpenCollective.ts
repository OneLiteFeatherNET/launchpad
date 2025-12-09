import { useRuntimeConfig } from '#imports'

type CollectiveResponse = {
  balance?: number
  backersCount?: number
  yearlyIncome?: number
  updatedAt?: string
  lastTransactionAt?: string
  currency?: string
}

export const useOpenCollective = () => {
  const config = useRuntimeConfig()
  const slug = (config.public as any)?.openCollectiveSlug || 'onelitefeather'
  const fallbackGoal = Number((config.public as any)?.openCollectiveGoal || 3000)
  const fallbackCurrency = (config.public as any)?.openCollectiveCurrency || 'EUR'
  const link = `https://opencollective.com/${slug}`

  const { data, error, refresh, pending } = useAsyncData(
    'opencollective-stats',
    async () => {
      const url = `${link}.json`
      const res = await $fetch<CollectiveResponse>(url, { timeout: 5000 })

      const raisedCents = typeof res.balance === 'number' ? res.balance : 0
      const raised = Math.max(0, Math.round(raisedCents / 100))

      // Use goal from API if present (yearlyIncome), otherwise fallback
      const apiGoal = typeof res.yearlyIncome === 'number' ? Math.round(res.yearlyIncome / 100) : null

      return {
        slug,
        currency: res.currency || fallbackCurrency,
        totalRaised: raised,
        goal: apiGoal || fallbackGoal,
        contributors: res.backersCount ?? null,
        updatedAt: res.updatedAt || res.lastTransactionAt || new Date().toISOString(),
        link
      }
    },
    {
      server: true,
      lazy: false,
      default: () => ({
        slug,
        currency: fallbackCurrency,
        totalRaised: 0,
        goal: fallbackGoal,
        contributors: null,
        updatedAt: new Date().toISOString(),
        link
      })
    }
  )

  return {
    data,
    error,
    refresh,
    pending
  }
}
