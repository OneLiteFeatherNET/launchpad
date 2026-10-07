import type { LiteSupporter } from '../types'

/** Lite supporters through the cached server route; an empty list when it cannot be had. */
export function useLiteSupporters() {
  const { data } = useAsyncData<{ supporters: LiteSupporter[] }>(
    'lite-supporters',
    async () => {
      try {
        return await $fetch<{ supporters: LiteSupporter[] }>('/api/community/supporters', { timeout: 5000 })
      } catch (err) {
        console.warn('[useLiteSupporters] failed to load the supporters', err)
        return { supporters: [] }
      }
    },
    { default: () => ({ supporters: [] }) }
  )

  return { supporters: computed(() => data.value?.supporters ?? []) }
}
