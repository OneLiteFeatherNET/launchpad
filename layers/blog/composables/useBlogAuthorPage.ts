import { createError } from '#imports'
import { locales, type Locale } from '#layers/content-core'

/**
 * Data for `/<locale>/blog/author/<slug>`. A slug that is nobody, or a person
 * without a released article in this language, is a fatal 404 so the response
 * carries the status instead of an empty, indexable page.
 *
 * Publishes the slug for every language in which the page would answer 200;
 * the others are left out, so the switcher and hreflang never point at a 404.
 */
export async function useBlogAuthorPage() {
  const route = useRoute()
  const repo = useContentRepository()
  const setI18nParams = useSetI18nParams()
  const slug = computed(() => String((route.params as Record<string, unknown>).slug ?? ''))

  const posts = await useBlogPostsByAuthor(slug)

  if (!posts.person.value || !posts.articles.value.length) {
    throw createError({ statusCode: 404, statusMessage: 'Author not found', fatal: true })
  }

  const { data: available } = await useAsyncData<Locale[]>(
    () => `blog-author-locales-${slug.value}`,
    async () => {
      const now = new Date()
      const found: Locale[] = []
      for (const code of locales) {
        const articles = await repo.listBlogArticles(code)
        if (!articlesByAuthor(articles, slug.value, now).length) continue
        if (await resolvePerson(slug.value, code)) found.push(code)
      }
      return found
    },
    { watch: [slug], default: () => [] }
  )

  watch(available, (codes) => {
    setI18nParams(Object.fromEntries(codes.map((code) => [code, { slug: slug.value }])))
  }, { immediate: true })

  return { slug, ...posts }
}
