<script setup lang="ts">
import {definePageMeta} from "#imports";
import type { BlogArticle } from "#layers/blog";

const { locale, t, d } = useI18n()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'default',
});

const { blog, authors } = await useBlogArticle()

// Only fetches the roster when the article actually names team members —
// before this guard, every article page issued the content query and shipped
// the whole team document in its SSR payload, even for the vast majority of
// posts that never reference a member.
const hasTeamMembers = computed(() => (blog.value?.teamMembers?.length ?? 0) > 0)
const { bySlug } = useTeamRoster({ enabled: hasTeamMembers })

// Resolves what FeaturedTeamMembers used to fetch for itself. The lookup
// belongs here: this page is the root, so it may know both the blog and the
// team layer, and neither layer learns about the other.
const featuredMembers = computed(() => (blog.value?.teamMembers ?? [])
  .map((slug: string) => bySlug.value[slug])
  // `bySlug` is only ever keyed by a member's own slug, so every entry it
  // returns already has one — the `m.slug` half of this guard just narrows
  // the type for FeaturedMember below, it drops nothing at runtime.
  .filter((m): m is NonNullable<typeof m> & { slug: string } => Boolean(m?.slug))
  .map((member) => ({
    slug: member.slug,
    name: member.name,
    avatarUrl: teamAvatarUrl(
      { mcName: member.mcName, slug: member.slug, avatarUrl: member.avatarUrl },
      64
    ),
    role: toRoleString(member.role) ?? ''
  })))

// All Article-level SEO (meta tags, Article JSON-LD, breadcrumbs, OG
// image) lives in useArticleSeo — keeps this page focused on view code.
// Canonical + hreflang are emitted app-wide by @nuxtjs/i18n
// (layouts/default.vue), driven by the translated slugs useBlogArticle
// publishes via useSetI18nParams.
const { title, metaTitle } = useArticleSeo(blog, authors)

// Absolute URL for the share buttons. Built here rather than inline in the
// template: `locale` is a ref and a template auto-unwraps it, so the
// `locale.value` this used to interpolate evaluated to `undefined` — every
// share link and the copy button pointed at /undefined/blog/<slug>.
// Base URL resolution mirrors useArticleSeo: runtimeConfig.public.siteUrl is
// only set inside the $production block, so fall back to the site config,
// which is populated in every environment.
const site = useSiteConfig()
const shareUrl = computed(() => {
  const base = (config.public as { siteUrl?: string }).siteUrl || site.url
  return `${base}/${locale.value}/blog/${blog.value?.slug ?? ''}`
})

// Force the per-article title + description into the document head so social
// embeds (og:title / og:description) use the real article values — with
// umlauts. Without this, @nuxtjs/seo's route-derived fallback wins and emits
// an ASCII, slug-cased title (e.g. "Wenn Ein Server Ausfaellt …"). Any explicit
// `head` frontmatter is merged on top.
useHead(() => {
  const b = blog.value as BlogArticle | null
  if (!b) return {}
  // Uses metaTitle, not b.title. This block runs after useArticleSeo and wins,
  // so passing the raw title discarded both the per-article `seo.title`
  // override and the A/B-flagged `alternativeTitle` that composable resolves.
  const resolved = metaTitle.value
  const meta = [
    { name: 'description', content: b.description },
    { property: 'og:title', content: resolved },
    { property: 'og:description', content: b.description },
    { name: 'twitter:title', content: resolved },
    { name: 'twitter:description', content: b.description }
  ].filter((m) => Boolean(m.content))
  return { title: resolved, meta }
})

// The body is rendered by the content-core Prose* components, which style
// themselves; the `prose` classes this wrapper used compiled to nothing,
// because the typography plugin is not installed.
const articleClass
  = 'overflow-hidden rounded-large bg-surface-container-low shadow-elevation-1 '
    + 'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary'
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-8">
    <article
      v-if="blog"
      :class="articleClass"
      aria-labelledby="article-title"
    >
      <NuxtPicture
        v-if="blog?.headerImage"
        :src="blog?.headerImage"
        :alt="blog?.headerImageAlt || blog?.title || ''"
        sizes="xs:300px sm:500px md:700px lg:1200px xl:1920px"
        width="1920"
        height="1080"
        fit="cover"
        quality="80"
        :img-attrs="{ class: 'aspect-video object-cover w-full' }"
        format="avif,webp"
      />
      <div class="p-6 md:p-8">
        <h1 id="article-title" class="text-display-small font-bold text-on-surface">{{ title }}</h1>
        <time
          v-if="blog?.pubDate"
          class="mt-1 block text-body-medium text-on-surface-variant"
          :datetime="new Date(blog?.pubDate).toISOString()"
        >
          {{ d(new Date(blog?.pubDate as any)) }}
        </time>
        <div
          v-if="blog?.tags?.length"
          class="mt-3 flex flex-wrap gap-2"
        >
          <M3Chip
            v-for="tag in blog.tags"
            :key="tag"
            :label="tag"
            kind="label"
            color="secondary"
          />
        </div>
        <div
          v-if="authors?.length"
          class="mt-3 flex flex-wrap items-center gap-4 text-on-surface"
        >
          <div v-for="author in authors" :key="author.slug" class="flex items-center gap-3">
            <NuxtImg
              v-if="author.avatar"
              :src="author.avatar"
              :alt="author.name"
              width="48"
              height="48"
              class="h-12 w-12 rounded-full border border-outline-variant object-cover"
              format="webp"
            />
            <div>
              <p class="text-label-large">{{ author.name }}</p>
              <p v-if="author.role" class="text-label-small text-on-surface-variant">
                {{ author.role }}
              </p>
            </div>
          </div>
        </div>

        <section
          class="mt-4 md:mt-6"
          :aria-labelledby="'article-content-heading'"
        >
          <h2 id="article-content-heading" class="sr-only">{{ title }}</h2>
          <ContentRenderer :value="blog" />
        </section>

        <FeaturedTeamMembers
          v-if="featuredMembers.length"
          :members="featuredMembers"
        />

        <!-- Social Media Sharing Buttons -->
        <section class="mt-8 border-t border-outline-variant pt-6" :aria-label="t('article.share')">
          <h2 class="sr-only">{{ t('article.share') }}</h2>
          <LazySocialMediaShare
            :url="shareUrl"
            :title="blog?.title"
            :description="blog?.description || ''"
            :is-large-page="['alles-was-man-ueber-ethanol-wissen-sollte', 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible', 'plugins-open-for-adoption', 'effizientes-logging-in-paper-plugins', 'dev-blog-1'].includes(blog?.slug)"
          />
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>

</style>
