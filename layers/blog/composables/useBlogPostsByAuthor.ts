import type { Locale } from '#layers/content-core'
import type { BlogArticle, Person } from '../types'

interface AuthorPosts {
  articles: BlogArticle[]
  people: Person[]
}

/**
 * The released articles of one author, newest first, with the people named on
 * them. Decided inside the data handler so the list travels in the payload and
 * the browser never asks the clock again while hydrating.
 */
export async function useBlogPostsByAuthor(slug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data, status } = await useAsyncData<AuthorPosts>(
    () => `blog-author-${activeLocale.value}-${toValue(slug)}`,
    async () => {
      const articles = articlesByAuthor(
        await repo.listBlogArticles(activeLocale.value),
        toValue(slug),
        new Date()
      )
      const slugs = [...new Set([toValue(slug), ...articles.flatMap(authorSlugsOf)])]
      return { articles, people: await resolvePeople(slugs, activeLocale.value) }
    },
    {
      watch: [activeLocale, () => toValue(slug)],
      default: () => ({ articles: [], people: [] }),
      ...PAGE_DATA_OPTIONS
    }
  )

  const articles = computed(() => data.value.articles)
  const person = computed(() => data.value.people.find((p) => p.slug === toValue(slug)) ?? null)

  const authorsOf = (article: BlogArticle): Person[] => {
    const bySlug = new Map(data.value.people.map((p) => [p.slug, p]))
    return authorSlugsOf(article)
      .map((authorSlug) => bySlug.get(authorSlug))
      .filter((p): p is Person => Boolean(p))
  }

  const loading = useIsLoading(status)

  return { articles, person, authorsOf, loading, data, status }
}
