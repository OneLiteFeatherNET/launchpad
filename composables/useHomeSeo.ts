import type { PageSeoOptions } from '~/types/seo'
import { usePageSeo } from './usePageSeo'

export function useHomeSeo(opts: PageSeoOptions = {}) {
  const { t } = useI18n()

  return usePageSeo({
    description: opts.description || t('seo.default_description'),
    ...opts
  })
}
