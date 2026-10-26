import type { PageSeoOptions } from '#layers/content-core'

export function useHomeSeo(opts: PageSeoOptions = {}) {
  const { t } = useI18n()

  // Resolve the i18n key safely; if the key is missing, vue-i18n returns the key itself.
  const rawKeywords = t('seo.default_keywords')
  const defaultKeywords = rawKeywords && rawKeywords !== 'seo.default_keywords' ? rawKeywords : undefined

  // The title already leads with the brand; the global " | OneLiteFeather" suffix would repeat it.
  useHead({ titleTemplate: '%s' })

  return usePageSeo({
    description: opts.description || t('index.description'),
    keywords: opts.keywords || defaultKeywords,
    ...opts
  })
}

