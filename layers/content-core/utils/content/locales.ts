/**
 * The languages this site publishes, and the only place they are named.
 *
 * Split out of `collections.ts` so it can be imported from anywhere without
 * dragging along `@nuxt/content`'s `defineCollection` and `zod` — a Nitro
 * route handler needs the list, not the collection factory, and pulling a
 * build-time API into the server runtime to get at a two-element array is a
 * bad trade.
 *
 * `collections.ts` re-exports both, so existing imports keep working.
 */
export const locales = ['de', 'en'] as const

export type Locale = (typeof locales)[number]
