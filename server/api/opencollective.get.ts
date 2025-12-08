import { defineEventHandler, useRuntimeConfig } from '#imports'

type CollectiveResponse = {
  balance?: number
  backersCount?: number
  updatedAt?: string
  lastTransactionAt?: string
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const slug = (config.public as any)?.openCollectiveSlug || 'onelitefeather'
  const goalRaw = (config.public as any)?.openCollectiveGoal
  const goal = goalRaw ? Number(goalRaw) : 3000
  const currency = (config.public as any)?.openCollectiveCurrency || 'EUR'

  const url = `https://opencollective.com/${slug}.json`

  try {
    const res = await $fetch<CollectiveResponse>(url, { timeout: 5000 })
    const raisedCents = typeof res.balance === 'number' ? res.balance : 0
    const raised = Math.max(0, Math.round(raisedCents / 100))

    return {
      slug,
      currency,
      totalRaised: raised,
      goal,
      contributors: res.backersCount ?? null,
      updatedAt: res.updatedAt || res.lastTransactionAt || new Date().toISOString()
    }
  } catch (error) {
    console.error('[OpenCollective] fetch failed', error)
    return {
      slug,
      currency,
      totalRaised: 0,
      goal,
      contributors: null,
      updatedAt: new Date().toISOString(),
      error: 'unavailable'
    }
  }
})
