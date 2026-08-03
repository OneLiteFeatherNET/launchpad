import { defineCollection } from '@nuxt/content'
import { z } from 'zod'

import { locales } from './locales'
import type { Locale } from './locales'

// Both imported and re-exported: the factories below use them, and existing
// `from './collections'` imports must keep resolving. A bare
// `export … from './locales'` would forward the names without binding them
// here, which is a ReferenceError at runtime and TS2304 at compile time.
export { locales }
export type { Locale }

export const withI18nMeta = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => schema.extend({
    translationKey: z.string().optional(),
    canonical: z.string().url().optional(),
    alternates: z
      .array(z.object({
          hreflang: z.string(),
          href: z.string().url()
        }))
      .optional()
  })

type CollectionFactory = (locale: Locale) => ReturnType<typeof defineCollection>

export const createLocalizedCollections = (
  name: string,
  factory: CollectionFactory
): Record<string, ReturnType<typeof defineCollection>> => locales.reduce<Record<string, ReturnType<typeof defineCollection>>>((acc, locale) => {
    acc[`${name}_${locale}`] = factory(locale)
    return acc
  }, {})

export const defineLocalizedCollections = (
  name: string,
  configFactory: (locale: Locale) => Parameters<typeof defineCollection>[0]
) => createLocalizedCollections(name, (locale) => defineCollection(configFactory(locale)))
