import type { ContentRepository } from '~/utils/content/repository'
import { createNuxtContentAdapter } from '~/utils/content/nuxtContentAdapter'

let instance: ContentRepository | null = null

/**
 * Returns the active {@link ContentRepository}. This is the single place that
 * decides which content backend the app talks to — swapping @nuxt/content for
 * a headless CMS later means changing only the adapter constructed here (or
 * branching on `useRuntimeConfig().public.content.provider`); no composable,
 * page or component needs to change.
 *
 * The adapter is stateless, so a module-level singleton is safe for both SSR
 * and client.
 */
export function useContentRepository(): ContentRepository {
  if (!instance) {
    instance = createNuxtContentAdapter()
  }
  return instance
}
