import type { LiteSupporter } from '#layers/opencollective/types'

// Same caching shape as discord.get.ts: swr is off (a background refresh needs
// waitUntil) and a throw is never stored.
const cachedSupporters = defineCachedFunction(
  (slug: string) => loadLiteSupporters(fetch, { slug }),
  { name: 'lite-supporters', maxAge: LITE_SUPPORTERS_CACHE_TTL, swr: false, getKey: (slug: string) => slug }
)

export default defineEventHandler(async (): Promise<{ supporters: LiteSupporter[] }> => {
  const pub = useRuntimeConfig().public as Record<string, string | number | undefined>
  const slug = String(pub.openCollectiveSlug || 'onelitefeather')
  try {
    return { supporters: await cachedSupporters(slug) }
  } catch (err) {
    console.warn('[supporters] failed to load the supporter list', err)
    return { supporters: [] }
  }
})
