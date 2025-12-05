import { defineCollection } from '@nuxt/content'
import { z } from 'zod'

export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export const withI18nMeta = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.extend({
    translationKey: z.string().optional(),
    canonical: z.string().url().optional(),
    alternates: z
      .array(
        z.object({
          hreflang: z.string(),
          href: z.string().url()
        })
      )
      .optional()
  })

type CollectionFactory = (locale: Locale) => ReturnType<typeof defineCollection>

export const createLocalizedCollections = (
  name: string,
  factory: CollectionFactory
): Record<string, ReturnType<typeof defineCollection>> =>
  locales.reduce<Record<string, ReturnType<typeof defineCollection>>>((acc, locale) => {
    acc[`${name}_${locale}`] = factory(locale)
    return acc
  }, {})

export const defineLocalizedCollections = (
  name: string,
  configFactory: (locale: Locale) => Parameters<typeof defineCollection>[0]
) =>
  createLocalizedCollections(name, (locale) => defineCollection(configFactory(locale)))
