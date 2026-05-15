import type { PageSeoOptions } from '~/types/seo'
import { usePageSeo } from './usePageSeo'

export function useHomeSeo(opts: PageSeoOptions = {}) {
  const { t } = useI18n()

  // Resolve the i18n key safely; if the key is missing, vue-i18n returns the key itself.
  const rawKeywords = t('seo.default_keywords')
  const defaultKeywords = rawKeywords && rawKeywords !== 'seo.default_keywords' ? rawKeywords : undefined

  return usePageSeo({
    description: opts.description || t('seo.default_description'),
    keywords: opts.keywords || defaultKeywords,
    schemaType: opts.schemaType || 'WebSite',
    ...opts
  })
}

