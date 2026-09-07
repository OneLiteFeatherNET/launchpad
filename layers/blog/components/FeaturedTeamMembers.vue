<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NuxtLink } from '#components'

/**
 * One member as this component needs to draw it. Deliberately not `TeamMember`
 * from the team layer: importing that type would put the blog layer back into
 * a domain it must not know, and the component uses four fields of it.
 *
 * The page resolves slugs, avatars and role labels — it sits at the root and
 * may know both layers. What arrives here is finished presentation data.
 */
export type FeaturedMember = {
  slug: string
  name: string
  avatarUrl: string
  /** Already formatted; empty string renders no role line. */
  role: string
}

const props = defineProps<{ members: FeaturedMember[] }>()

const { t, locale } = useI18n()
</script>

<template>
  <section
    v-if="props.members.length"
    class="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-6"
    :aria-labelledby="'featured-team-heading'"
  >
    <h2
      id="featured-team-heading"
      class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400"
    >
      {{ t('blog.featured_team') }}
    </h2>
    <ul class="mt-3 flex flex-wrap gap-3">
      <li v-for="m in props.members" :key="m.slug">
        <NuxtLink
          :to="`/${locale}/team/${m.slug}`"
          class="inline-flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
        >
          <NuxtImg
            :src="m.avatarUrl"
            :alt="t('team.avatar_alt', { name: m.name })"
            width="32"
            height="32"
            fit="cover"
            format="avif,webp"
            quality="80"
            densities="x1 x2"
            class="h-8 w-8 rounded-lg object-cover"
            loading="lazy"
            decoding="async"
          />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{ m.name }}</span>
            <span v-if="m.role" class="block text-xs text-neutral-600 dark:text-neutral-400">{{ m.role }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
