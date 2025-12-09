import type { PageSeoOptions } from '~/types/seo'
import { usePageSeo } from './usePageSeo'

export function useHomeSeo(opts: PageSeoOptions = {}) {
  return usePageSeo({
    description:
      opts.description ||
      'OneLiteFeather is a Minecraft Network sharing development tools with the community.',
    ...opts
  })
}
