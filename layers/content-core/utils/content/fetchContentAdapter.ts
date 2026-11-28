import { CONTENT_API_PATH, CONTENT_METHODS } from './contentApi'
import type { ContentMethod } from './contentApi'
import type { ContentRepository } from './repository'

type Fetcher = <T>(url: string, options: { query: { args: string } }) => Promise<T>

// Nuxt 4.7 types `$fetch` so strictly that it no longer overlaps this narrow call shape.
const defaultFetcher = $fetch as unknown as Fetcher

/**
 * The browser's {@link ContentRepository}: every method asks the server route
 * instead of querying a SQLite copy in WebAssembly, so a client-side
 * navigation downloads neither the wasm nor an SQL dump.
 *
 * `GET` with the arguments as one JSON array in call order, so equal queries
 * are equal URLs and the edge can cache them. The route answers `{ result }`
 * because a bare `null` would not survive as a body.
 */
export function createFetchContentAdapter(fetcher: Fetcher = defaultFetcher): ContentRepository {
  const repository: Record<string, (...args: unknown[]) => Promise<unknown>> = {}
  for (const method of CONTENT_METHODS satisfies readonly ContentMethod[]) {
    repository[method] = async (...args) => {
      const response = await fetcher<{ result: unknown }>(`${CONTENT_API_PATH}/${method}`, {
        query: { args: JSON.stringify(args) }
      })
      return response.result
    }
  }
  return repository as unknown as ContentRepository
}
